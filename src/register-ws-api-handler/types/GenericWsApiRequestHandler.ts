import type { AnyQuery } from 'yaschema-api';
import type { AnyCommands } from 'yaschema-ws-api';

import type { WsApiRequestHandler } from './WsApiRequestHandler';

export type GenericWsApiRequestHandler = WsApiRequestHandler<AnyCommands, AnyCommands, string, AnyQuery>;
