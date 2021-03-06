import chai from 'chai';

import apiErrorMiddleware, { ApiError } from '../../src/middlewares/apiErrorMiddleware';


describe('apiErrorMiddleware', () => {
  const nextHandler = apiErrorMiddleware();

  it('must change callback\'s first argument from Object to an ApiError', done => {
    const func = (x, callback) => callback({
      errorMessage: 'That 301',
      errorCode: 301,
      errorResponse: 'foo bar',
    });
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.an.instanceof(ApiError);
      chai.expect(error.message).to.be.equal('That 301');
      chai.expect(error.status).to.be.equal(301);
      chai.expect(error.response).to.be.equal('foo bar');
      done();
    });
  });

  it('must store extra params in the meta key', done => {
    const func = (x, callback) => callback({
      errorMessage: 'That 404',
      errorCode: 404,
      foo: 'bar',
      bul: 'bi',
    });
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.an.instanceof(ApiError);
      chai.expect(error.message).to.be.equal('That 404');
      chai.expect(error.meta).to.deep.equal({
        foo: 'bar',
        bul: 'bi',
      });
      done();
    });
  });

  it('must not change anything if callback does not return an error', done => {
    const func = (x, callback) => callback(null, 2);
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(2);
      done();
    });
  });

  it('must not change error if callback already return one', done => {
    const javascriptError = new Error('test');
    const func = (params, callback) => callback(javascriptError);
    nextHandler(func)(1, (error, result) => {
      chai.expect(error).to.be.equal(javascriptError);
      done();
    });
  });

  it('must JSON.parse errorResponse if it\'s possible', done => {
    const func = (params, callback) => callback({
      errorMessage: 'error',
      errorCode: '500',
      errorResponse: '{"error": "error"}',
    });

    nextHandler(func)({}, (error, result) => {
      chai.expect(error.response).to.deep.equal({ error: 'error' });
      done();
    });
  });

  it('must not failed if errorResponse is already an object', done => {
    const func = (params, callback) => callback({
      errorMessage: 'error',
      errorCode: '500',
      errorResponse: { error: 'error' },
    });

    nextHandler(func)({}, (error, result) => {
      chai.expect(error.response).to.deep.equal({ error: 'error' });
      done();
    });
  });

  it('must not failed if errorResponse is a string', done => {
    const func = (params, callback) => callback({
      errorMessage: 'error',
      errorCode: '500',
      errorResponse: 'error',
    });

    nextHandler(func)({}, (error, result) => {
      chai.expect(error.response).to.equal('error');
      done();
    });
  });
});
