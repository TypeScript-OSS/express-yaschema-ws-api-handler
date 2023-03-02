import type { AnyQuery } from 'yaschema-ws-api';

import type { WsApiConnectionChangeHandler } from './WsApiConnectionChangeHandler';
import type { WsApiErrorHandler } from './WsApiErrorHandler';
import type { WsApiMessageReceiptHandler } from './WsApiMessagReceiptHandler';

export interface WsApiEventHandlers<QueryT extends AnyQuery> {
  onConnect?: WsApiConnectionChangeHandler<QueryT>;
  onDisconnect?: WsApiConnectionChangeHandler<QueryT>;
  onMessage?: WsApiMessageReceiptHandler<QueryT>;
  onError?: WsApiErrorHandler<QueryT>;
}
