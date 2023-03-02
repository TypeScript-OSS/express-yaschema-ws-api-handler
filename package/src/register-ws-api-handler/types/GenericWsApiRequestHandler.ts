import type { AnyCommands, AnyQuery } from 'yaschema-ws-api';

import type { WsApiRequestHandler } from './WsApiRequestHandler';

export type GenericWsApiRequestHandler = WsApiRequestHandler<AnyCommands, AnyCommands, string, AnyQuery>;
