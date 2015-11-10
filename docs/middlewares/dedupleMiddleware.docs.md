# [Deduple middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/src/middlewares/dedupleMiddleware.js)

When possible, this middleware will merge operation if they have the same params, this permit to reduce the number of call made to the API.

If a request is merged it don't continue the middleware chain, so be carefull with the order.

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
sdk.AnalysesController.getQueryAggregate(
  {...params, queries: Array<Query>},
  (error, result) => {
    //Handle Result
  }
);
sdk.AnalysesController.getQueryAggregate(
  {...params, queries: Array<Query>},
  (error, result) => {
    //Handle Result
  }
);
```
