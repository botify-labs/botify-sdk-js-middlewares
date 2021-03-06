# botify-sdk-middlewares

This package contains multiple middlewares allowing to customize and optimize  Botify SDK's behaviour. Including local storage caching, request batching, api result post processing.

**Note:** examples are written with *ES6 syntax* but nothing prevents you to use this lib (and create middlewares) with plain old school JavaScript.


## Glossary
- **Operation:** function that is specifically designed to call ONE API endpoint. *ie. getProjectDatasets*
- **Controller:** Set of operations. *ie. AnalysisController, ProjectController*

## Installation
```SH
npm install --save botify-sdk-middlewares
```

You’ll also need the Botify SDK (core).
```SH
npm install --save botify-sdk
```

### UMD bundle
An UMD bundle is available in `dist/botify-sdk-middlewares.min.js`. It means you can use the lib with any module loader, including Browserify.
It exposes the global variable `BotifySDKMiddlewares`.

```HTML
<script src="/node_modules/botify-sdk-middlewares/dist/botify-sdk-middlewares.min.js"></script>
```


## Usage
Use `applyMiddleware` function to apply middlewares you need.

### Initialize middlewares
```JS
import { applyMiddleware, apiErrorMiddleware, lscacheMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  lscacheMiddleware()
)(baseSdk);
```
**<!> Becareful: order maters.** (read middleware's documentation **requirement section**).


### RECOMMENDED setup to use every middlewares
```JS
import {
  applyMiddleware,
  apiErrorMiddleware,
  batchMiddleware,
  dedupleMiddleware,
  getUrlDetailEncodeMiddleware,
  invalidateAnalysisMiddleware,
  jobsMiddleware,
  lscacheMiddleware,
  queryMiddleware,
} from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  getUrlDetailEncodeMiddleware,
  queryMiddleware(),
  invalidateAnalysisMiddleware,
  lscacheMiddleware(),
  dedupleMiddleware,
  jobsMiddleware(),
  batchMiddleware(),
)(baseSdk);
```


### Middlewares options
Some middlewares takes options (read middleware's documentation **middlewares options section**). If they does, **they need to be called as functions**.

Example:
```JS
import { applyMiddleware, batchMiddleware } from 'botify-sdk-middlewares';
const { DEFAULT_BATCHED_OPERATIONS } = batchMiddleware;
import baseSdk from 'botify-sdk';

const batchMiddlewareOptions = {
  ...DEFAULT_BATCHED_OPERATIONS,
  getQueryAggregate: {
    ...DEFAULT_BATCHED_OPERATIONS.getQueryAggregate,
    queueLimit: 2,
  },
};
const sdk = applyMiddleware(
  batchMiddleware(batchMiddlewareOptions) //batchMiddleware is a factory
)(baseSdk);
```


### Operations options
Some middlewares use options on operations (read middleware's documentation **operation options section**)
**Important** : Middlewares consume their options so you can't chain 2 same middlewares.

```JS
SDK::Controller::operation(params: Object, callback: Func, options: Object?)
```

Example:
```JS
const params = {
  username: 'botify',
  projectSlug: 'botify.com',
  analyseSlug: 'foo',
};
const options = {
  cache: true,
};
sdk.AnalysesController.getAnalysis(params, (error, result) => {
  //Handle result
}, options);
```


## Go deeper

- [How to write your own middleware](./howToWriteYourOwnMiddleware.md)
- [Middlewares docs](./middlewares)
