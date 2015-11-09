import ExtendableError from 'es6-error';


export default class ApiError extends ExtendableError {
  constructor(body, statusCode, response) {
    const message = `ApiError: [${statusCode}] - ${body}`;
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    this.body = body;
  }
}
