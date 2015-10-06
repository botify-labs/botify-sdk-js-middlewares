import expect from 'expect';
import chai from 'chai';

import apiError, {ApiError} from '../../src/middlewares/apiError';


describe('apiError middleware', () => {
  const nextHandler = apiError();

  it('must change callback\'s first argument from Object to an ApiError', done => {
    const func = (x, callback) => callback({
      ErrorMessage: 'That 301',
      ErrorCode: 301
    });
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.an.instanceof(ApiError);
      chai.expect(error.message).to.be.equal('ApiError: [301] - That 301');
      chai.expect(error.statusCode).to.be.equal(301);
      chai.expect(error.body).to.be.equal('That 301');
      done();
    });
  });

  it('must not change anything if callback does not return an error', done => {
    const func = (x, callback) => callback(null, 2);
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(2);
      done();
    });
  });

});
