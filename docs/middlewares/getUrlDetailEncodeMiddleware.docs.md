# [getUrlDetail middleware](../../src/middlewares/getUrlDetailEncodeMiddleware.js)

The middleware encode url param given to getUrlDetail operation

## Middleware requirement
none

## Operation options
none

## Usage
```JS
import { applyMiddleware, getUrlDetailEncodeMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  getUrlDetailEncodeMiddleware,
)(baseSdk);

sdk.ProjectController.getUrlDetail(
  {
    ...params,
    url: 'http://botify.com/pricing',
  },
  (error, result) => {
    //Handle api success
  }
});
```

Without the middleware:
```JS
sdk.ProjectController.getUrlDetail(
  {
    ...params,
    url: encodeURIComponent('http://botify.com/pricing'),
  },
  (error, result) => {
    //Handle api success
  }
});
```
