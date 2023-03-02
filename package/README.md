# express-yaschema-ws-api-handler

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Express support for handling WebSocket APIs declared using yaschema-ws-api.

## Basic Example

```typescript
// API schema and metadata
// You'll typically define this in a separate package shared by your server and clients
export const stream = makeWsApi({
  routeType: 'stream',
  url: '/stream',
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
});
```

```typescript
import expressWS, { WithWebsocketMethod } from 'express-ws';

…

// Add WebSocket support to Express
expressWs(app);
const appWithWs = app as typeof app & WithWebsocketMethod;
```

```typescript
registerWsApiHandler(
  appWithWs,
  api.stream,
  {},
  {
    ping: async ({ input, output }) => output.pong({ body: `PONG${(input?.echo?.length ?? 0) > 0 ? ' ' : ''}${input?.echo ?? ''}` }),
    hello: async ({ output }) => output.hello({ body: 'world' })
  }
)
```

The options object passed to `registerWsApiHandler` lets you override the validation mode and/or specify middleware.

## Thanks

Thanks for checking it out.  Feel free to create issues or otherwise provide feedback.

[API Docs](https://passfolio.github.io/express-yaschema-ws-api-handler/)

Be sure to check out our other [Open Source @ Passfolio](https://github.com/Passfolio) projects as well.

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/express-yaschema-ws-api-handler.svg

[downloads]: https://www.npmjs.com/package/express-yaschema-ws-api-handler

[size-badge]: https://img.shields.io/bundlephobia/minzip/express-yaschema-ws-api-handler.svg

[size]: https://bundlephobia.com/result?p=express-yaschema-ws-api-handler
