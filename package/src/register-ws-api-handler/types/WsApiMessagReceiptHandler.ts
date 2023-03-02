import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyQuery } from 'yaschema-ws-api';

export type WsApiMessageReceiptHandler<QueryT extends AnyQuery> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  connectionId: string;
  query: QueryT;
  message: WebSocket.Data;
}) => Promise<void>;
