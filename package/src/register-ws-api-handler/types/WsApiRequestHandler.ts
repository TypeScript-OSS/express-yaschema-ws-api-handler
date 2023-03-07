import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyCommands, AnyQuery } from 'yaschema-ws-api';

import type { WsApiResponders } from './WsApiResponders';

export type WsApiRequestHandler<
  RequestCommandsT extends AnyCommands,
  ResponseCommandsT extends AnyCommands,
  CommandNameT extends keyof RequestCommandsT & string,
  QueryT extends AnyQuery,
  ExtraArgsT extends Record<string, any> = Record<string, never>
> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  connectionId: string;
  query: QueryT;
  input: RequestCommandsT[CommandNameT]['valueType'];
  output: WsApiResponders<ResponseCommandsT>;
  extras: ExtraArgsT;
}) => Promise<void>;
