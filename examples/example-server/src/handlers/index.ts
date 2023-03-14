import type { Express } from 'express';
import type { WithWebsocketMethod } from 'express-ws';

import * as ping from './ping';
import * as stream from './stream';

export const register = async (app: Express & WithWebsocketMethod) => Promise.all([ping.register(app), stream.register(app)]);
