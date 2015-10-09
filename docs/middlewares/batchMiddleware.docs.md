# batch middleware

Whenever possible, the middleware automatically batch operations called in the **same tick**. [read about JS ticks](http://blog.carbonfive.com/2013/10/27/the-javascript-event-loop-explained)

Some operation like `AnalysesController.getQueryAggregate` accepts that multiple resources (ie. queries) to be requested in the same HTTP Request. This middlewares takes advantage of this feature leading to performance improvement as it greatly reduces the number of request done with large applications.

## Options
none

## Middleware requirement
none

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
const { batchMiddleware } = middlewares;
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  batchMiddleware
)(baseSdk);

const params = {
  username: 'botify',
  projectSlug: 'botify.com',
  analyseSlug: 'foo',
};

// The following requests will be batched. (Though, it doesn't affect the way you use the SDK)
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
