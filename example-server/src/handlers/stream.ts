import type { Express } from 'express';
import type { WithWebsocketMethod } from 'express-ws';
import { registerWsApiHandler } from 'express-yaschema-ws-api-handler';

import * as api from '../api';

export const register = (app: Express & WithWebsocketMethod) =>
  registerWsApiHandler(
    app,
    api.stream,
    {},
    {
      ping: async ({ express, input, output }) => {
        console.log('New ping request with query:', express.req.query, 'and params:', express.req.params);

        output.pong({ body: `PONG${(input?.echo?.length ?? 0) > 0 ? ' ' : ''}${input?.echo ?? ''}` });
      },
      hello: async ({ output }) => output.hello({ body: 'world' })
    }
  );
