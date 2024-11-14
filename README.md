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

### Initializing Multiple Express Servers Simultaneously

If you happen to be potentially initializing multiple Express servers simultaneously (e.g. on different ports) and you're using Yaschema API for more than one of these servers, you will need to extend your `Express` instance to support `YaschemaApiExpressContextAccessor` by calling `addYaschemaApiExpressContextAccessorToExpress(express, context)` before calling `registerWsApiHandler` -- where `context` should be unique for each Express server, and can be created using `makeYaschemaApiExpressContext`.

## Thanks

Thanks for checking it out.  Feel free to create issues or otherwise provide feedback.

[API Docs](https://typescript-oss.github.io/express-yaschema-ws-api-handler/)

Be sure to check out our other [TypeScript OSS](https://github.com/TypeScript-OSS) projects as well.

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/express-yaschema-ws-api-handler.svg

[downloads]: https://www.npmjs.com/package/express-yaschema-ws-api-handler

[size-badge]: https://img.shields.io/bundlephobia/minzip/express-yaschema-ws-api-handler.svg

[size]: https://bundlephobia.com/result?p=express-yaschema-ws-api-handler
