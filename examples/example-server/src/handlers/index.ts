import type { Express } from 'express';
import type { WithWebsocketMethod } from 'express-ws';

import * as ping from './ping';
import * as stream from './stream';

export const register = (app: Express & WithWebsocketMethod) => {
  ping.register(app);
  stream.register(app);
};
