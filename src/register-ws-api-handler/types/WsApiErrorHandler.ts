import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyCommands, AnyQuery } from 'yaschema-ws-api';

import type { WsApiResponders } from './WsApiResponders';

export type WsApiErrorHandler<ResponseCommandsT extends AnyCommands, QueryT extends AnyQuery> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  connectionId: string;
  query: QueryT;
  error: Error;
  output: WsApiResponders<ResponseCommandsT>;
}) => Promise<void>;
