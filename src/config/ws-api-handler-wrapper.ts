import type { GenericWsApiRequestHandler } from '../register-ws-api-handler/types/GenericWsApiRequestHandler';

export type WsApiHandlerWrapper = (handler: GenericWsApiRequestHandler) => GenericWsApiRequestHandler;

let globalWsApiHandlerWrapper: WsApiHandlerWrapper =
  (handler: GenericWsApiRequestHandler): GenericWsApiRequestHandler =>
  async (fwd) => {
    try {
      return await handler(fwd);
    } catch (_e) {
      // Catching and ignoring by default
    }
  };

export const getWsApiHandlerWrapper = () => globalWsApiHandlerWrapper;

export const setWsApiHandlerWrapper = (wrapper: WsApiHandlerWrapper) => {
  globalWsApiHandlerWrapper = wrapper;
};
