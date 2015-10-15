import ApiError from '../errors/ApiError';


export default function apiErrorMiddleware() {
  return next => function(params, callback, options) {
    next(
      params,
      function(error) {
        if (!error) {
          callback(...arguments);
          return;
        }
        const { ErrorMessage, ErrorCode } = error;
        callback(new ApiError(ErrorMessage, ErrorCode));
      },
      options
    );
  };
}

export {
  ApiError,
};
