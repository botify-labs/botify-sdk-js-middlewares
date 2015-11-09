import ExtendableError from 'es6-error';


export default class ApiError extends ExtendableError {
  constructor(message, statusCode, response) {
    super(`ApiError: [${statusCode}] - ${message}`);
    this.statusCode = statusCode;
    this.response = response;
  }
}
