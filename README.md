# botify-sdk-js-middlewares

[![Build Status](https://travis-ci.org/botify-labs/botify-sdk-js-middlewares.svg?branch=master)](https://travis-ci.org/botify-labs/botify-sdk-js-middlewares)

This package contains multiple middlewares allowing to customize and optimize  Botify SDK's behaviour. Including local storage caching, request batching, api result post processing.


## Installation
```
npm install --save botify-sdk-js-middlewares
```

You’ll also need the Botify SDK (core).
```
npm install --save botify-sdk-js
```

## Usage
Use `applyMiddleware` function to apply middlewares you need.

```JS
import { applyMiddleware, apiErrorMiddleware, lscacheMiddleware } from 'botify-sdk-js-middlewares';
import baseSdk from 'botify-sdk-js';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  lscacheMiddleware()
)(baseSdk);
```
**<!> Becareful: order maters.** (read middleware's documentation **requirement section**).

### UMD bundle
A bundle is available in `dist/botify-sdk-js-middlewares.min.js`. It exposes the global variable `BotifySdkJsMiddlewares`.


## Documentation
- [Introduction](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/docs/introduction.md)
- [How to write your own middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/docs/howToWriteYourOwnMiddleware.md)
- [Middlewares docs](https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/docs/middlewares)

Note: examples are written with ES6 syntax but nothing prevents you to use this lib (and create middlewares) with plain old school JavaScript.


## Commands

- `npm run lint`: lint sources and tests using ESlint.
- `npm test`: launch tests
- `npm run test:watch`: watch files and execute the tests whenever sources or tests change.

## Influences

The middleware pattern used in this package has been greatly inspired by [Redux](https://github.com/rackt/redux) middlewares.
