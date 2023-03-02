import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyQuery } from 'yaschema-ws-api';

export type WsApiErrorHandler<QueryT extends AnyQuery> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  connectionId: string;
  query: QueryT;
  error: Error;
}) => Promise<void>;
