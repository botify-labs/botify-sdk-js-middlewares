import chai from 'chai';
import sinon from 'sinon';

import dedupleMiddleware from '../../src/middlewares/dedupleMiddleware';

describe('dedupleMiddleware', () => {
  it('must call operation one time if multiple call with the same controller, operation, parameters and options', done => {
    const middleware = dedupleMiddleware({
      controllerId: 'controller',
      operationId: 'operation',
    });
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middleware(spiedOperation)(1, spiedCallback, { option: true });
    middleware(spiedOperation)(1, spiedCallback, { option: true });
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(1);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });

  it('must call operation two time if multiple call with different controllerId', done => {
    const middlewareController1 = dedupleMiddleware({
      controllerId: 'controller1',
      operationId: 'operation',
    });
    const middlewareController2 = dedupleMiddleware({
      controllerId: 'controller2',
      operationId: 'operation',
    });
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middlewareController1(spiedOperation)(1, spiedCallback, { option: true });
    middlewareController2(spiedOperation)(1, spiedCallback, { option: true });
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(2);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });

  it('must call operation two time if multiple call with different operationId', done => {
    const middlewareOperation1 = dedupleMiddleware({
      controllerId: 'controller',
      operationId: 'operation1',
    });
    const middlewareOperation2 = dedupleMiddleware({
      controllerId: 'controller',
      operationId: 'operation2',
    });
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middlewareOperation1(spiedOperation)(1, spiedCallback, { option: true });
    middlewareOperation2(spiedOperation)(1, spiedCallback, { option: true });
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(2);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });

  it('must call operation two time if multiple call with different parameters', done => {
    const middleware = dedupleMiddleware({
      controllerId: 'controller',
      operationId: 'operation',
    });
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middleware(spiedOperation)(1, spiedCallback, { option: true });
    middleware(spiedOperation)(2, spiedCallback, { option: true });
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(2);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });

  it('must call operation two time if multiple call with different options', done => {
    const middleware = dedupleMiddleware({
      controllerId: 'controller',
      operationId: 'operation',
    });
    const operation = (params, callback) => setImmediate(() => callback());
    const spiedOperation = sinon.spy(operation);
    const spiedCallback = sinon.spy();

    middleware(spiedOperation)(1, spiedCallback, { option: true });
    middleware(spiedOperation)(1, spiedCallback, { option: false });
    setImmediate(() => {
      chai.expect(spiedOperation.callCount).to.be.equal(2);
      chai.expect(spiedCallback.callCount).to.be.equal(2);
      done();
    });
  });
});
