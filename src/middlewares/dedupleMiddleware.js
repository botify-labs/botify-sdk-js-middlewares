import objectHash from 'object-hash';

/**
 * @return {Middleware}
 */
export default function dedupleMiddleware() {
  const currentOperations = {};

  return next => function(params, callback, options) {
    const hash = objectHash({
      params,
      options,
    });

    if (currentOperations[hash]) {
      currentOperations[hash].push(callback);
    } else {
      currentOperations[hash] = [callback];
      next(
        params,
        (error, result) => {
          currentOperations[hash].forEach(cb => cb(error, result));
          delete currentOperations[hash];
        },
        options
      );
    }
  };
}
