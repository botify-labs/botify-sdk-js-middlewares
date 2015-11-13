# [Lscache middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/src/middlewares/lscacheMiddleware.js)

The middleware enable api calls to be cached in the browser's local storage.

## Middleware requirement
none

## Middleware options
- cachedOperations: Map of operations that are cached by default

## Operation options
- cache: is set to true, sdk first tries to retrieve api result from local storage before calling the API. Local storage available space is limited, therefore only mostly used resources are kept in cache.
- invalidate: Replace the stored value by the value returned by the API.

## Usage
```JS
import { applyMiddleware, lscacheMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  lscacheMiddleware({
    cachedOperations: [
      { // This operation will be cached by default
        controllerId: 'AnalysisController',
        operationId: 'getUrls',
      },
    ],
  })
)(baseSdk);

const callback = (error, result) => {
  //Handle result
};
sdk.ProjectController.getProjets(userId, callback, {cache: true});
```
