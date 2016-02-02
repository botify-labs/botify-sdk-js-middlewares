# [ApiError middleware](../../src/middlewares/apiErrorMiddleware.js)

The middleware transform callback error (if exists) from an Error Payload to a Javascript Error

## Middleware requirement
none

## Operation options
none

## Usage
```JS
import { applyMiddleware, apiErrorMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  apiErrorMiddleware,
)(baseSdk);

const { ApiError } = middlewares.apiError.ApiError;
sdk.ProjectController.getProjets(userId, (error, result) => {
  if (error && error instanceof ApiError) {
    const { message, statusCode, message } = error;
    //Handle api error
    return;
  }
  //Handle api success
}, {cache: true});
```

Without the middleware:
```JS
sdk.ProjectController.getProjets(userId, (error, result) => {
  if (error) {
     const { errorMessage, errorCode } = error;
     if (errorMessage && errorCode) {
        //Handle api error
     }
     return;
  }
  //Handle api success
}, {cache: true});
```
