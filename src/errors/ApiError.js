import ExtendableError from 'es6-error';


export default class ApiError extends ExtendableError {
  constructor(body, statusCode) {
    const message = `ApiError: [${statusCode}] - ${body}`;
    super(message);
    this.statusCode = statusCode;
    this.body = body;
  }
}
