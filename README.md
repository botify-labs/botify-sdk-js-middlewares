# botify-sdk-middlewares

This package contains multiple middlewares in order to customize and optimize the behaviour of the Botify SDK,
including local storage caching, request batching, api result post processing.


## Influences

The middleware pattern used in this package has been greated influenced by [Redux](https://github.com/rackt/redux)


## Installation
```
npm install --save botify-sdk-middlewares
```

You’ll also need the Botify SDK (core).
```
npm install --save botify-sdk
```

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
import sdk from 'botify-sdk';

sdk = applyMiddleware(
  middlewares.apiError,
  middlewares.lscache
)(sdk);

sdk.ProjectController.getProjets(userId, (error, result) => {

});
```

## Documentation

- [Introduction](https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/docs/introduction)
- [How to write your own middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/docs/howToWriteYourOwnMiddleware)
- [Middlewares docs](https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/docs/middlewares)


## Commands

- `npm run lint`: lint sources and tests using ESlint.
- `npm test`: launch tests
- `npm run test:watch`: watch files and execute the tests whenever sources or tests change.
