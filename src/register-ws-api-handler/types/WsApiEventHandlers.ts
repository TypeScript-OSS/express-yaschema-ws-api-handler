import type { AnyQuery } from 'yaschema-api';
import type { AnyCommands } from 'yaschema-ws-api';

import type { WsApiConnectionChangeHandler } from './WsApiConnectionChangeHandler';
import type { WsApiErrorHandler } from './WsApiErrorHandler';
import type { WsApiMessageReceiptHandler } from './WsApiMessageReceiptHandler';

export interface WsApiEventHandlers<ResponseCommandsT extends AnyCommands, QueryT extends AnyQuery> {
  onConnect?: WsApiConnectionChangeHandler<ResponseCommandsT, QueryT>;
  onDisconnect?: WsApiConnectionChangeHandler<ResponseCommandsT, QueryT>;
  onMessage?: WsApiMessageReceiptHandler<ResponseCommandsT, QueryT>;
  onError?: WsApiErrorHandler<ResponseCommandsT, QueryT>;
}
