import bodyParser from 'body-parser';
import express from 'express';
import type { WithWebsocketMethod } from 'express-ws';
import expressWs from 'express-ws';
import { finalizeApiHandlerRegistrations } from 'express-yaschema-api-handler';
import type * as http from 'http';
import WebSocket from 'ws';
import { schema } from 'yaschema';
import { setDefaultUrlBase, setUrlBaseForRouteType } from 'yaschema-api';
import { makeWsApi } from 'yaschema-ws-api';
import type { CommonWebSocket } from 'yaschema-ws-api-client';
import { apiWs, setWebSocket } from 'yaschema-ws-api-client';

import { waitFor } from '../__test_dependency__/wait-for';
import { registerWsApiHandler } from '../register-ws-api-handler/register-ws-api-handler';
import { shutdownWsHandlers, unshutdownWsHandlers } from '../shutdown';

const port = Number.parseInt(process.env.PORT ?? '8088');

export const stream = makeWsApi({
  routeType: 'stream',
  url: '/stream',
  schemas: {
    requests: {
      ping: schema.object({ echo: schema.string().allowEmptyString().optional() }).optional(),
      hello: schema.any().optional()
    },
    responses: {
      pong: schema.object({
        body: schema.string()
      }),
      hello: schema.object({
        body: schema.string()
      })
    }
  }
});

describe('Stream', () => {
  let server: http.Server | undefined;

  beforeAll(
    async () =>
      new Promise<void>((resolve, reject) => {
        const app = express();

        app.use(bodyParser.json({ type: 'application/json' }));

        expressWs(app);
        const appWithWs = app as typeof app & WithWebsocketMethod;

        registerWsApiHandler(
          appWithWs,
          stream,
          {},
          {
            ping: async ({ express, input, output }) => {
              console.log('New ping request with query:', express.req.query, 'and params:', express.req.params);

              output.pong({ body: `PONG${(input?.echo?.length ?? 0) > 0 ? ' ' : ''}${input?.echo ?? ''}` });
            },
            hello: async ({ output }) => output.hello({ body: 'world' })
          }
        );

        finalizeApiHandlerRegistrations();

        try {
          server = app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);

            resolve();
          });
        } catch (e) {
          reject(e);
        }
      })
  );

  beforeAll(() => {
    setDefaultUrlBase(`http://localhost:${port}`);
    setUrlBaseForRouteType('stream', `ws://localhost:${port}`);
    setWebSocket(WebSocket as any as CommonWebSocket);
  });

  afterAll(
    async () =>
      new Promise<void>((resolve) => {
        if (server === undefined) {
          setTimeout(resolve, 0);
          return;
        }

        const shutdownWsHandlersPromise = shutdownWsHandlers();

        server.close(async () => {
          await shutdownWsHandlersPromise;

          unshutdownWsHandlers();

          setTimeout(resolve, 0);
        });
      })
  );

  it('should work', async () => {
    const got: string[] = [];
    let markConnected: () => void;
    const isConnected = new Promise<void>((resolve) => {
      markConnected = resolve;
    });
    const connection = await apiWs(
      stream,
      {},
      {
        hello: async ({ input }) => {
          got.push(`hello response: ${input.body}`);
        },
        pong: async ({ input }) => {
          got.push(`pong response: ${input.body}`);
        }
      },
      {
        onConnect: async () => {
          markConnected();
        }
      }
    );

    try {
      await isConnected;

      expect(connection.ws.readyState).toBe(WebSocket.OPEN);

      await connection.output.hello('test');
      await waitFor(() => expect(got[got.length - 1]).toBe('hello response: world'));

      await connection.output.ping({ echo: 'Hello World!' });
      await waitFor(() => expect(got[got.length - 1]).toBe('pong response: PONG Hello World!'));

      expect(true).toBe(true);
    } finally {
      connection.ws.close();
    }
  });
});
