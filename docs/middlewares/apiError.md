# apiError middleware

The middleware transform callback error (if exists) from an Error Payload to a Javascript Error

## Middleware requirement
none

## Usage
```JS
import { applyMiddleware, middlewares } from 'botify-sdk-middlewares';
import sdk from 'botify-sdk';

sdk = applyMiddleware(
  middlewares.apiError,
)(sdk);

const { ApiError } = middlewares.apiError.ApiError;
sdk.ProjectController.getProjets(userId, (error, result) => {
  if (error && error instanceof ApiError) {
    const { message, statusCode, message } = error;
    //Handle api error
  }
  //Handle api success
}, {cache: true});
```

Without the middleware:
```JS
sdk.ProjectController.getProjets(userId, (error, result) => {
  if (error) {
     const { ErrorMessage, ErrorCode } = error;
     if (ErrorMessage && ErrorCode) {
        //Handle api error
     }
     return;
  }
  //Handle api success
}, {cache: true});
```
