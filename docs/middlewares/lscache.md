# lscache middleware

The middleware enable api calls to be cached in the browser's local storage.

## Description
If the option cache is set to true, sdk first tries to retrieve api result from local storage before requesting the API. Local storage available space is limited, therefore only mostly used resources are kept in cache.

## Middleware requirement
none

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
import sdk from 'botify-sdk';

sdk = applyMiddleware(
  middlewares.apiError,
  middlewares.lscache
)(sdk);

sdk.ProjectController.getProjets(userId, (error, result) => {
  //Handle result
}, {cache: true});
```
