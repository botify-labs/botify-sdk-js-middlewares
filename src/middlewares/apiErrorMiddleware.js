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
        let parsedErrorResponse;
        try {
          parsedErrorResponse = JSON.parse(errorResponse);
        } catch (err) {
          parsedErrorResponse = errorResponse;
        } finally {
          callback(new ApiError(errorMessage, errorCode, parsedErrorResponse, othersProps));
        }
      },
      options
    );
  };
}

export {
  ApiError,
};
