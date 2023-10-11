import type WebSocket from 'ws';
import type { AnyBody, GenericWsApi } from 'yaschema-ws-api';

interface OnCommandRequestValidationErrorHandlerArgs {
  api: GenericWsApi;
  command: string;
  /** This will be undefined in cases where we didn't get to deserialize the request */
  req: AnyBody;
  rawData: WebSocket.Data;
  invalidPart: 'body';
  validationError: string;
}

let globalOnCommandRequestValidationErrorHandler: (args: OnCommandRequestValidationErrorHandlerArgs) => void = () => {};

/** Gets the configured function that will be called whenever a request validation error occurs */
export const getOnCommandRequestValidationErrorHandler = () => globalOnCommandRequestValidationErrorHandler;

/** Sets the configured function that will be called whenever a request validation error occurs */
export const setOnCommandRequestValidationErrorHandler = (handler: (args: OnCommandRequestValidationErrorHandlerArgs) => void) => {
  globalOnCommandRequestValidationErrorHandler = handler;
};

/** Triggers the configured function that will be called whenever a request validation error occurs */
export const triggerOnCommandRequestValidationErrorHandler = (args: OnCommandRequestValidationErrorHandlerArgs) => {
  globalOnCommandRequestValidationErrorHandler(args);
};
