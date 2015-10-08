# lscache middleware

The middleware enable api calls to be cached in the browser's local storage.

## Options
- cache: is set to true, sdk first tries to retrieve api result from local storage before calling the API. Local storage available space is limited, therefore only mostly used resources are kept in cache.
- invalidate: Replace the stored value by the value returned by the API.

## Middleware requirement
none

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  middlewares.apiError,
  middlewares.lscache
)(baseSdk);

const callback = (error, result) => {
  //Handle result
};
sdk.ProjectController.getProjets(userId, callback, {cache: true});
```
