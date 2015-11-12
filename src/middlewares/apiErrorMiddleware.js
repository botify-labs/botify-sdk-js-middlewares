import ApiError from '../errors/ApiError';

export default function apiErrorMiddleware() {
  return next => function(params, callback, options) {
    next(
      params,
      function(error) {
        if (!error || error instanceof Error) {
          callback(...arguments);
          return;
        }
        const { errorMessage, errorCode, errorResponse, ...othersProps } = error;
        callback(new ApiError(errorMessage, errorCode, errorResponse, othersProps));
      },
      options
    );
  };
}

export {
  ApiError,
};
