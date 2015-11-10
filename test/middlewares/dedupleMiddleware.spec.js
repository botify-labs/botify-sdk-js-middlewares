import chai from 'chai';
import sinon from 'sinon';

import dedupleMiddleware from '../../src/middlewares/dedupleMiddleware';

describe('dedupleMiddleware', () => {
  it('must call operation one time if multiple call with the same parameters', done => {
    const middleware = dedupleMiddleware();
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middleware(spiedOperation)(1, spiedCallback);
    middleware(spiedOperation)(1, spiedCallback);
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(1);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });

  it('must call operation two time if multiple call with different parameters', done => {
    const middleware = dedupleMiddleware();
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middleware(spiedOperation)(1, spiedCallback);
    middleware(spiedOperation)(2, spiedCallback);
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(2);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });
});
