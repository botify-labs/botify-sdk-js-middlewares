# [Batch middleware](../../src/middlewares/batchMiddleware.js)

Whenever possible, the middleware automatically batches operations called in the **same tick**. [read about JS ticks](http://blog.carbonfive.com/2013/10/27/the-javascript-event-loop-explained)

The middleware makes also the batch endpoint like `getQueryAggregate` easier to use by restructuring the result.

Some operation like `AnalysesController.getQueryAggregate` accepts that multiple resources (ie. queries) to be requested in the same HTTP Request. This middleware takes advantage of this feature leading to performance improvement as it greatly reduces the number of requests done with large applications.

## Middleware requirement
none

## Middleware options
- **batchedOperations:** Map of operations that can be batched
  - **queueLimit:** Max number of resource to call at a time
- **timeout:** Modify timeout before a batch of requests are send, by default it's next tick

## Operation options
- batch : force an operation to be batch or not

**Warning:** This middleware do not propagate operation options. So it should be the last middleware in the chain.

## Usage
```JS
import { applyMiddleware, batchMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  batchMiddleware()
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

## Result restructuring

A Batch endpoint like `getQueryAggregate` **always responds in 200**. Thought **a real status code is given for each requested resource** (query) using the following structure `{ status: Number, data: Any }`.

### Without the middleware
```JS
sdk.AnalysesController.getQueryAggregate(
  {...params, queries: [someQuery, someIncorrectQuery]},
  (error, result) => {
    assert(error).to.be.null; //no error
    assert(result[0]).to.be.deep.equal({
      status: 200,  //First requested succeed
      data: {
        count: 102,
        //etc
      },
    });
    assert(result[1]).to.be.deep.equal({
      status: 400,  //Second request failed
      error: {
        message: 'Query is not valid',
        error_code: 34,
      },
    });
  }
);
```

### With the middleware
When every query succeeds, you can expect the following: result are the content of the data keys which should be more straightforward and easier to use.
```JS
sdk = applyMiddleware(
  batchMiddleware()
)(baseSdk);

sdk.AnalysesController.getQueryAggregate(
  {...params, queries: [someQuery1, someQuery2]},
  (error, result) => {
    assert(error).to.be.null;
    assert(result[0]).to.be.deep.equal({
      count: 102,
      //etc
    });
    assert(result[1]).to.be.deep.equal({
      count: 204,
      //etc
    });
  }
);
```

#### When a query fails
Though, when a query fails, the result will be the following. Leading that you can't access to successful queries. It doesn't matter if both queries were needed to be processed (ie. a single graph need those both queries to be rendered, so receiving once without the other is useless).

```JS
sdk = applyMiddleware(
  batchMiddleware()
)(baseSdk);

sdk.AnalysesController.getQueryAggregate(
  {...params, queries: [someQuery, someIncorrectQuery]},
  (error, result) => {
    assert(error).to.be.equal({
      errorCode: 400,
      errorMessage: 'Resource 1 failed',
      errorResponse: {
        error: {
          error_code: 34,
          resource_index: 1, //Index (0-based) of the resource in error.
          message: 'Query is not valid',
        },
      },
    });
    assert(result).to.be.undefined;
  }
);
```

## Tip: Splitting getQueryAggregate calls.
Because of the way resources (queries) are processed (see bellow), it's good to know when you should call multiple queries at a time and when you shouldn't.

### When to call multiple queries at a time
When 2 queries depend on each other to be processed (like a chart requiring both), you should request both queries in a single call because the middleware composes for you possible errors.

### When to split queries
Although, when 2 queries doesn't depend on each others, you should split calls, because it allows you to manage errors independently, and may allow you to receive the first batch of queries quicker.

### Example
```JS
sdk = applyMiddleware(
  batchMiddleware()
)(baseSdk);

const someQuery1 = ...;
const someQuery2 = ...;
const someQuery3 = ...;

// someQuery1 and someQuery2 depends on each other to be used, so they should be
// called together, the middleware will return a composed error for both if ones fail.
sdk.AnalysesController.getQueryAggregate(
  {...params, queries: [someQuery1, someQuery2]}, (error, result) => {
    //Handle someQuery1 and someQuery2 results
  }
);

// someQuery3 doesn't depend on the others to be used, so it should be
// called separately in order to be managed independently.
sdk.AnalysesController.getQueryAggregate(
  {...params, queries: [someQuery3]}, (error, result) => {
    //Handle someQuery3 result
  }
);
```
