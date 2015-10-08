import ExtendableError from 'es6-error';


export class ApiError extends ExtendableError {
  constructor(body, statusCode) {
    const message = `ApiError: [${statusCode}] - ${body}`;
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.body = body;
  }
}

export default function apiErrorMiddleware() {
  return next => (params, callback, options) => {
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
