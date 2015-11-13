import objectHash from 'object-hash';

export default function dedupleMiddleware({controllerId, operationId}) {
  const currentOperations = {};

  return next => function(params, callback, options) {
    const hash = objectHash({
      controllerId,
      operationId,
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
          currentOperations[hash] = null;
        },
        options
      );
    }
  };
}
