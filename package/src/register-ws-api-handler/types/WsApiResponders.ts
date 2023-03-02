import type { AnyCommands } from 'yaschema-ws-api';

export type WsApiResponders<ResponseCommandsT extends AnyCommands> = {
  [K in keyof ResponseCommandsT & string]: (value: ResponseCommandsT[K]['valueType']) => Promise<void>;
};
