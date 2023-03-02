import { schema } from 'yaschema';
import { makeWsApi } from 'yaschema-ws-api';

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
