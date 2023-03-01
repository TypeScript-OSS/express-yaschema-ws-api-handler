import type { Schema } from 'yaschema';
import type { AnyQuery } from 'yaschema-ws-api';

import type { WsApiRequestHandler } from './WsApiRequestHandler';

export type WsApiRequestHandlers<
  RequestCommandsT extends Record<string, Schema>,
  ResponseCommandsT extends Record<string, Schema>,
  QueryT extends AnyQuery
> = {
  [K in keyof RequestCommandsT & string]: WsApiRequestHandler<RequestCommandsT, ResponseCommandsT, K, QueryT>;
};
