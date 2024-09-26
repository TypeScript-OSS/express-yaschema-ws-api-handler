import type { NextFunction, Request } from 'express';
import type WebSocket from 'ws';
import type { AnyQuery } from 'yaschema-api';
import type { AnyCommands } from 'yaschema-ws-api';

import type { WsApiResponders } from './WsApiResponders';

export type WsApiConnectionChangeHandler<ResponseCommandsT extends AnyCommands, QueryT extends AnyQuery> = (args: {
  express: {
    ws: WebSocket;
    req: Request;
    next: NextFunction;
  };
  connectionId: string;
  query: QueryT;
  /** Though output is passed to `onDisconnect` callbacks, its use will be ignored */
  output: WsApiResponders<ResponseCommandsT>;
}) => Promise<void>;
