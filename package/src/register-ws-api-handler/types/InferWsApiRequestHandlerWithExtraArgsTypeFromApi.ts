import type { WsApi } from 'yaschema-ws-api';

import type { WsApiRequestHandlerWithExtraArgs } from './WsApiRequestHandlerWithExtraArgs';

export type InferWsApiRequestHandlerWithExtraArgsTypeFromApi<
  ApiT,
  CommandNameT,
  ExtraArgsT extends Record<string, any>
> = ApiT extends WsApi<infer RequestCommandsT, infer ResponseCommandsT, infer QueryT>
  ? CommandNameT extends keyof RequestCommandsT & string
    ? WsApiRequestHandlerWithExtraArgs<RequestCommandsT, ResponseCommandsT, CommandNameT, QueryT, ExtraArgsT>
    : never
  : never;
