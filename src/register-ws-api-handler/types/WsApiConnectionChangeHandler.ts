import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyQuery } from 'yaschema-ws-api';

export type WsApiConnectionChangeHandler<QueryT extends AnyQuery> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  query: QueryT;
}) => Promise<void>;
