# invalidateAnalysis middleware

The middleware automatically invalidate Analysis cache when needed.

When requesting analysis's main info, the API returns (amongst other things) the date last modified. Leading that if this date changes, any data cached for this analysis need to be invalidated as they might have changed.

## Options
none

## Middleware requirement
- lscache (after)

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
const { invalidateAnalysisMiddleware, lscacheMiddleware } = middlewares;
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  invalidateAnalysisMiddleware,
  lscacheMiddleware
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
