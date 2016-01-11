# botify-sdk-middlewares

[![Build Status](https://travis-ci.org/botify-labs/botify-sdk-js-middlewares.svg?branch=master)](https://travis-ci.org/botify-labs/botify-sdk-js-middlewares)

This package contains multiple middlewares allowing to customize and optimize Botify SDK's behaviour. Including local storage caching, request dedupling, api result post processing.


## Installation
```SH
npm install --save botify-sdk-middlewares
```

You’ll also need the Botify SDK (core).
```SH
npm install --save botify-sdk
```

### UMD bundle
An UMD bundle is available in `dist/botify-sdk-middlewares.min.js`. It means you can use the lib with any module loader, including Browserify and RequireJS.
It exposes the global variable `BotifySDKMiddlewares`.

```HTML
<script src="/node_modules/botify-sdk-middlewares/dist/botify-sdk-middlewares.min.js"></script>
```


## Usage
Use `applyMiddleware` function to apply middlewares you need.

```JS
import { applyMiddleware, apiErrorMiddleware, lscacheMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  apiErrorMiddleware,
  lscacheMiddleware()
)(baseSdk);
```
**<!> Becareful: order maters.** (read middleware's documentation **requirement section**).


## Documentation
- [Introduction](./docs/introduction.md)
- [How to write your own middleware](./docs/howToWriteYourOwnMiddleware.md)
- [Middlewares docs](./docs/middlewares)

Note: examples are written with ES6 syntax but nothing prevents you to use this lib (and create middlewares) with plain old school JavaScript.


## Commands

- `npm run lint`: lint sources and tests using ESlint.
- `npm test`: launch tests
- `npm run test:watch`: watch files and execute the tests whenever sources or tests change.

## Influences

The middleware pattern used in this package has been greatly inspired by [Redux](https://github.com/rackt/redux) middlewares.
