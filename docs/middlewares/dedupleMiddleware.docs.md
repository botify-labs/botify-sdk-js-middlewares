# [Deduple middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/src/middlewares/dedupleMiddleware.js)

When possible, this middleware will merge operation if they have the same params, this permit to reduce the number of call made to the API.

Middlewares chain of duplicate operations are interrupted. So you might consider middlewares order carefully.

## Middleware requirement
none

## Operation options
none

## Usage
``` javascript
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
const { dedupleMiddleware } = middlewares;
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  dedupleMiddleware
)(baseSdk);

const params = {
  username: 'botify',
  projectSlug: 'botify.com',
  analyseSlug: 'foo',
};

// There is 2 same requests but with this middleware only one call will be made to the API
sdk.AnalysesController.getAnalysisSummary(params, (error, result) => {
   //Handle Result
});
sdk.AnalysesController.getAnalysisSummary(params, (error, result) => {
   //Handle Result
});
```
