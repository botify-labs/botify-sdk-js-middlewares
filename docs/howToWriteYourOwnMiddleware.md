# How to write your own middleware

To define a new middleware you must export a function that creates your middleware using the provided middleware API.

```JS
/**
 * @param  {String} middlewareAPI.contollerId ie. 'AnalysesController'
 * @param  {String} middlewareAPI.operationId ie. 'getAnalysisInfo'
 * @param  {Func}   middlewareAPI.operation
 * @return {Middleware}
 */
export default function lscacheMiddleware({contollerId, operationId, operation}) {

  /**
   * @metaparam {Func}     next Function to call with modified arguments for the next middleware
   * @param     {Object}   params
   * @param     {Function} callback
   * @param     {Object}   options
   * @return    {Boolean}  Return false to stop middlewares chain and prevent operation to be called
   */
  return next => function(params, callback, options) {
    if (...) {
      // Call next with modifing arguments as is to not modify operation
      return next(...arguments);
    }

    if (...)
      // Call operation callback to give result right away
      callback(null, itemValue);
      // Return false to stop middelwares chains
      return false;
    }

    //Overide callback to do any kind of processing when the callback is called (once the API has return data or once a later middleware call it).
    next(
      params,
      function(error, result) {
        // You may want to postprocess callback result.
        result = anyPostProcessing(result);
        callback(error, result);
      },
      options
    );
  };
}
```

## Example
Read `src/middlewares/lscacheMiddleware.js`
