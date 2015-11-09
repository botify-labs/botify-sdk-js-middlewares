# How to write your own middleware

Middlewares are functions that perform tasks before and after an operation (that call an API endpoint).

They can be used to modify parameters given to the operation, modify data received by the API, stop an operation call, cache data on the fly, batch requests, etc.

## Examples
Example middlewares can be found at: https://github.com/botify-labs/botify-sdk-js-middlewares/tree/master/src/middlewares; you should read them first as they provide simple examples of what you can achieve with this project.

## Structure
```JS
/**
 * @param  {String} middlewareAPI.contollerId ie. 'AnalysesController'
 * @param  {String} middlewareAPI.operationId ie. 'getAnalysisInfo'
 * @return {Middleware}
 */
export default function someMiddleware({contollerId, operationId}) {

  /**
   * @metaparam {Func}     next Function to call with modified arguments for the next middleware
   * @param     {Object}   params
   * @param     {Function} callback
   * @param     {Object}   options
   * @return    {Boolean}  Return false to stop middlewares chain and prevent operation to be called
   */
  return next => function(params, callback, options) {
    // Perform any kind of modifications on arguments
    // Or even stop operation call
  };
}
```

## Use cases
All of the following use cases can be composed to match your needs. Keep in mind that they are just examples.

### Modify params given to the operation (before the call)
```JS
export default function someMiddleware() {
  return next => function(params, callback, options) {
    const newParams = {
      ...params,
      foo: 'bar',
    };
    next(newParams, callback, options);
  };
}
```

### Modify data received by the API
```JS
export default function someMiddleware() {
  return next => function(params, callback, options) {
    next(
      params,
      function(error, result) {
        if (!error) {
          result = _.indexBy(result, 'id');
        }
        callback(error, result);
      },
      options
    );
  };
}
```

### Stop operation call (and the next middlewares)
```JS
export default function someMiddleware() {
  return next => function(params, callback, options) {
    callback(new ForbiddenError());
    return false;
    //Don't forget to call the callback to give the result to the caller.
  };
}
```

### Delay call
```JS
export default function someMiddleware() {
  return next => function(params, callback, options) {
    setTimeout(() => {
      next(...arguments);
    }, 3000);
  };
}
```
