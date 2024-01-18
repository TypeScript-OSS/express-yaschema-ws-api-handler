import type { WsApi } from 'yaschema-ws-api';

import type { WsApiRequestHandler } from './WsApiRequestHandler';

export type InferWsApiRequestHandlerTypeFromApi<ApiT, CommandNameT, ExtraArgsT extends Record<string, any> = Record<string, never>> =
  ApiT extends WsApi<infer RequestCommandsT, infer ResponseCommandsT, infer QueryT>
    ? CommandNameT extends keyof RequestCommandsT & string
      ? WsApiRequestHandler<RequestCommandsT, ResponseCommandsT, CommandNameT, QueryT, ExtraArgsT>
      : never
    : never;
