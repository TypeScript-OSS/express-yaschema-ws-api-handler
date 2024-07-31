import type { Request } from 'express';
import type { GenericWsApi } from 'yaschema-ws-api';

interface OnRequestValidationErrorHandlerArgs {
  api: GenericWsApi;
  expressReq: Request;
  invalidPart: 'query';
  validationError: string;
  validationErrorPath: string;
}

let globalOnRequestValidationErrorHandler: (args: OnRequestValidationErrorHandlerArgs) => void = () => {};

/** Gets the configured function that will be called whenever a request validation error occurs */
export const getOnRequestValidationErrorHandler = () => globalOnRequestValidationErrorHandler;

/** Sets the configured function that will be called whenever a request validation error occurs */
export const setOnRequestValidationErrorHandler = (handler: (args: OnRequestValidationErrorHandlerArgs) => void) => {
  globalOnRequestValidationErrorHandler = handler;
};

/** Triggers the configured function that will be called whenever a request validation error occurs */
export const triggerOnRequestValidationErrorHandler = (args: OnRequestValidationErrorHandlerArgs) => {
  globalOnRequestValidationErrorHandler(args);
};
