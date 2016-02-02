import ExtendableError from 'es6-error';


export default class ApiError extends ExtendableError {
  constructor(message, status, response, othersProps) {
    super(message);
    this.status = status;
    this.response = response;
    this.meta = othersProps;
  }
}
