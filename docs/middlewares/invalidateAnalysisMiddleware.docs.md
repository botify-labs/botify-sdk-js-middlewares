# [InvalidateAnalysis middleware](https://github.com/botify-labs/botify-sdk-js-middlewares/blob/master/src/middlewares/invalidateAnalysisMiddleware.js)

The middleware automatically invalidate Analysis cache when needed.

When requesting analysis's main info, the API returns (amongst other things) the date last modified. Leading that if this date changes, any data cached for this analysis need to be invalidated as they might have changed.

## Middleware requirement
- lscache (after)

## Operation options
none

## Usage
```JS
import { applyMiddleware, invalidateAnalysisMiddleware, lscacheMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  invalidateAnalysisMiddleware,
  lscacheMiddleware()
)(baseSdk);

const params = {
  username: 'botify',
  projectSlug: 'botify.com',
  analyseSlug: 'foo',
};

// Calling getAnalysis may invalidate previously cached data on this analysis.
sdk.AnalysesController.getAnalysis(params, (error, result) => {
  //Handle Result
});
```
