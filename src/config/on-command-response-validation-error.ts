import type { AnyBody, GenericWsApi } from 'yaschema-ws-api';

interface OnCommandResponseValidationErrorHandlerArgs {
  api: GenericWsApi;
  command: string;
  /** This will be undefined in cases where we didn't get to deserialize the response */
  res: AnyBody | undefined;
  invalidPart: 'body';
  validationError: string;
}

let globalOnCommandResponseValidationErrorHandler: (args: OnCommandResponseValidationErrorHandlerArgs) => void = () => {};

/** Gets the configured function that will be called whenever a response validation error occurs */
export const getOnCommandResponseValidationErrorHandler = () => globalOnCommandResponseValidationErrorHandler;

/** Sets the configured function that will be called whenever a response validation error occurs */
export const setOnCommandResponseValidationErrorHandler = (handler: (args: OnCommandResponseValidationErrorHandlerArgs) => void) => {
  globalOnCommandResponseValidationErrorHandler = handler;
};

/** Triggers the configured function that will be called whenever a response validation error occurs */
export const triggerOnCommandResponseValidationErrorHandler = (args: OnCommandResponseValidationErrorHandlerArgs) => {
  globalOnCommandResponseValidationErrorHandler(args);
};
