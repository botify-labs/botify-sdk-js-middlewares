import ExtendableError from 'es6-error';


export default class ApiResponseError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}
