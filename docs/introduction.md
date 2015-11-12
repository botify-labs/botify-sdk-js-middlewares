# botify-sdk-js-middlewares

This package contains multiple middlewares allowing to customize and optimize  Botify SDK's behaviour. Including local storage caching, request batching, api result post processing.

**Note:** examples are written with *ES6 syntax* but nothing prevents you to use this lib (and create middlewares) with plain old school JavaScript.


## Glossary
- **Operation:** function that is specifically designed to call ONE API endpoint. *ie. getProjectDatasets*
- **Controller:** Set of operations. *ie. AnalysisController, ProjectController*


## Usage
Use `applyMiddleware` function to apply middlewares you need.

### Initialize middlewares
```JS
import { applyMiddleware, apiErrorMiddleware, lscacheMiddleware } from 'botify-sdk-js-middlewares';
import baseSdk from 'botify-sdk-js';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  lscacheMiddleware()
)(baseSdk);
```
**<!> Becareful: order maters.** (read middleware's documentation **requirement section**).

### AMD or script tag old school way
A bundle is available in `dist/botify-sdk-js-middlewares.min.js`. It exposes the global variable `BotifySdkMiddlewares`.


### RECOMMENDED setup
```JS
import {
  applyMiddleware,
  apiErrorMiddleware,
  batchMiddleware,
  getUrlDetailEncodeMiddleware,
  invalidateAnalysisMiddleware,
  lscacheMiddleware,
  queryMiddleware,
  dedupleMiddleware,
} from 'botify-sdk-js-middlewares';
import baseSdk from 'botify-sdk-js';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  getUrlDetailEncodeMiddleware,
  queryMiddleware(),
  invalidateAnalysisMiddleware,
  lscacheMiddleware(),
  dedupleMiddleware,
  batchMiddleware(),
)(baseSdk);
```


### Middlewares options
Some middlewares takes options (read middleware's documentation **middlewares options section**). If they does, **they need to be called as functions**.

Example:
```JS
import { applyMiddleware, batchMiddleware } from 'botify-sdk-js-middlewares';
const { DEFAULT_BATCHED_OPERATIONS } = batchMiddleware;
import baseSdk from 'botify-sdk-js';

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

- [How to write your own middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/docs/howToWriteYourOwnMiddleware.md)
- [Middlewares docs](https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/docs/middlewares)
