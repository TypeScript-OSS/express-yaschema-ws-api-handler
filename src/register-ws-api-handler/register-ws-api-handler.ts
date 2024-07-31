import type { Express, NextFunction, Request } from 'express';
import type { WithWebsocketMethod } from 'express-ws';
import { registerApiHandler } from 'express-yaschema-api-handler';
import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';
import type { Schema, ValidationMode } from 'yaschema';
import { schema } from 'yaschema';
import type { AnyQuery, GenericWsApi, WsApi } from 'yaschema-ws-api';
import { genericCommandSchema } from 'yaschema-ws-api';

import { triggerOnCommandRequestValidationErrorHandler } from '../config/on-command-request-validation-error.js';
import { triggerOnCommandResponseValidationErrorHandler } from '../config/on-command-response-validation-error.js';
import { triggerOnRequestValidationErrorHandler } from '../config/on-request-validation-error.js';
import { getDefaultRequestValidationMode, getDefaultResponseValidationMode } from '../config/validation-mode.js';
import { getWsApiHandlerWrapper } from '../config/ws-api-handler-wrapper.js';
import { getUrlPathnameUsingRouteType } from '../internal-utils/get-url-pathname.js';
import { blockWsHandlerShutdownUntilComplete, isShuttingDown, onDidShutdown } from '../shutdown.js';
import type { GenericWsApiRequestHandler } from './types/GenericWsApiRequestHandler';
import type { WsApiEventHandlers } from './types/WsApiEventHandlers';
import type { WsApiRequestHandler } from './types/WsApiRequestHandler';
import type { WsApiRequestHandlers } from './types/WsApiRequestHandlers';
import type { WsApiResponders } from './types/WsApiResponders';

const anyStringSerializableTypeSchema = schema.oneOf3(
  schema.number().setAllowedSerializationForms(['number', 'string']),
  schema.boolean().setAllowedSerializationForms(['boolean', 'string']),
  schema.string()
);

const anyReqQuerySchema = schema
  .record(schema.string(), schema.oneOf(anyStringSerializableTypeSchema, schema.array({ items: anyStringSerializableTypeSchema })))
  .optional();

export interface WsApiHandlerOptions {
  requestValidationMode?: ValidationMode;
  responseValidationMode?: ValidationMode;
}

export const registerWsApiHandler = <
  RequestCommandsT extends Record<string, Schema>,
  ResponseCommandsT extends Record<string, Schema>,
  QueryT extends AnyQuery
>(
  app: Express & WithWebsocketMethod,
  api: WsApi<RequestCommandsT, ResponseCommandsT, QueryT>,
  {
    requestValidationMode = getDefaultRequestValidationMode(),
    responseValidationMode = getDefaultResponseValidationMode()
  }: WsApiHandlerOptions,
  requestHandlers: WsApiRequestHandlers<RequestCommandsT, ResponseCommandsT, QueryT>,
  eventHandlers: WsApiEventHandlers<ResponseCommandsT, QueryT> = {}
) => {
  const expressWsHandler = async (ws: WebSocket, req: Request, next: NextFunction) => {
    const express = { ws, req, next };
    const connectionId = uuid();

    const reqQuery = await (api.schemas.connection?.query ?? anyReqQuerySchema).deserializeAsync(req.query, {
      validation: requestValidationMode
    });

    if (requestValidationMode !== 'none') {
      if (reqQuery.error !== undefined) {
        triggerOnRequestValidationErrorHandler({
          api: api as any as GenericWsApi,
          expressReq: express.req,
          invalidPart: 'query',
          validationError: reqQuery.error,
          validationErrorPath: reqQuery.errorPath
        });
        if (requestValidationMode === 'hard') {
          ws.close(1008); // Policy violation (closest thing to bad request)
          return;
        }
      }
    }

    const query = reqQuery.deserialized as QueryT;

    const onError = (_err: Error) => {
      ws.close();
    };

    const removeOnDidShutdown = onDidShutdown(() => ws.close(1012)); // 1012 = Service is restarting -- ref https://github.com/Luka967/websocket-close-codes

    const onClose = async (_code: number, _reason: string) => {
      removeOnDidShutdown();

      ws.off('error', onError);
      ws.off('close', onClose);
      ws.off('message', onMessage);

      await eventHandlers.onDisconnect?.({ express, connectionId, query, output });
    };

    const output = (Object.entries(api.schemas.responses) as Array<[keyof ResponseCommandsT & string, Schema]>).reduce(
      (out, [responseCommandName, responseCommand]) => {
        out[responseCommandName] = async (value) => {
          if (ws.readyState !== WebSocket.OPEN) {
            // Ignoring output attempts when the WebSocket isn't open
            return;
          }

          return blockWsHandlerShutdownUntilComplete(async () => {
            const commandSerializationResult = await responseCommand.serializeAsync(value, { validation: responseValidationMode });
            if (commandSerializationResult.error !== undefined) {
              if (responseValidationMode === 'hard') {
                triggerOnCommandResponseValidationErrorHandler({
                  api: api as any as GenericWsApi,
                  command: responseCommandName,
                  res: value,
                  invalidPart: 'body',
                  validationError: commandSerializationResult.error,
                  validationErrorPath: commandSerializationResult.errorPath
                });
                return;
              }
            }

            const genericResponse = genericCommandSchema.serialize(
              { command: responseCommandName, body: commandSerializationResult.serialized },
              { validation: 'hard' }
            );
            if (genericResponse.error !== undefined) {
              console.warn(
                `Failed to serialize response for command ${responseCommandName}, which shouldn't happen:`,
                genericResponse.error
              );
              return;
            }

            ws.send(JSON.stringify(genericResponse.serialized));
          });
        };
        return out;
      },
      {} as Partial<WsApiResponders<ResponseCommandsT>>
    ) as WsApiResponders<ResponseCommandsT>;

    const asyncHandlerWrapper = getWsApiHandlerWrapper();
    const wrappedRequestHandlers: Partial<WsApiRequestHandlers<RequestCommandsT, ResponseCommandsT, QueryT>> = {};

    const onMessage = async (data: WebSocket.Data) => {
      if (isShuttingDown()) {
        return; // Ignoring incoming messages while shutting down
      }

      return blockWsHandlerShutdownUntilComplete(async () => {
        eventHandlers.onMessage?.({ express, connectionId, query, message: data, output });

        if (typeof data !== 'string') {
          return;
        }

        let json: any;
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          json = JSON.parse(data);
        } catch (e) {
          if (e instanceof Error) {
            eventHandlers.onError?.({ express, connectionId, query, error: e, output });
          }
          return;
        }

        const genericRequest = genericCommandSchema.deserialize(json, { validation: 'hard' });
        if (genericRequest.error !== undefined) {
          eventHandlers.onError?.({ express, connectionId, query, error: new Error(genericRequest.error), output });
          return;
        }

        const requestCommandName = genericRequest.deserialized.command as keyof RequestCommandsT & string;
        const requestCommand = api.schemas.requests[requestCommandName];
        if (requestCommand === undefined) {
          eventHandlers.onError?.({
            express,
            connectionId,
            query,
            error: new Error(`No definition found for command ${requestCommandName}`),
            output
          });
          return;
        }

        // Lazily wrapping commands as they're used the first time
        let wrappedRequestHandler = wrappedRequestHandlers[requestCommandName];
        if (wrappedRequestHandler === undefined) {
          const requestHandler = requestHandlers[requestCommandName];
          if (requestHandler === undefined) {
            eventHandlers.onError?.({
              express,
              connectionId,
              query,
              error: new Error(`No request handler found for command ${requestCommandName}`),
              output
            });
            return;
          }

          wrappedRequestHandler = asyncHandlerWrapper(requestHandler as GenericWsApiRequestHandler) as WsApiRequestHandler<
            RequestCommandsT,
            ResponseCommandsT,
            typeof requestCommandName,
            QueryT
          >;
          wrappedRequestHandlers[requestCommandName] = wrappedRequestHandler;
        }

        const commandDeserializationResult = await requestCommand.deserializeAsync(genericRequest.deserialized.body, {
          validation: requestValidationMode
        });
        if (commandDeserializationResult.error !== undefined) {
          triggerOnCommandRequestValidationErrorHandler({
            api: api as any as GenericWsApi,
            command: requestCommandName,
            req: commandDeserializationResult.deserialized as RequestCommandsT[typeof requestCommandName]['valueType'],
            rawData: data,
            invalidPart: 'body',
            validationError: commandDeserializationResult.error,
            validationErrorPath: commandDeserializationResult.errorPath
          });
          if (requestValidationMode === 'hard') {
            return;
          }
        }

        await wrappedRequestHandler({
          express,
          connectionId,
          query,
          input: commandDeserializationResult.deserialized as RequestCommandsT[typeof requestCommandName]['valueType'],
          output,
          extras: {}
        });
      });
    };

    await eventHandlers.onConnect?.({ express, connectionId, query, output });

    ws.on('error', onError);
    ws.on('close', onClose);
    ws.on('message', onMessage);
  };

  // Note: this strips any host-related info and doesn't check whether this server is the "right" server to handle these requests
  const relativizedUrl = getUrlPathnameUsingRouteType(api.routeType, api.url);

  registerApiHandler(api, 'ws', undefined, relativizedUrl, () => {
    app.ws(relativizedUrl, expressWsHandler);
  });
};
