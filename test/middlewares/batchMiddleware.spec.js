import chai from 'chai';
import sinon from 'sinon';

import batchMiddleware, { DEFAULT_BATCHED_OPERATIONS } from '../../src/middlewares/batchMiddleware';


describe('batchMiddleware', () => {
  const analysisParams = {
    username: 'botify',
    projectSlug: 'botify.com',
    analysisSlug: 'thatAnalysis',
  };
  const options = { thatOption: true };

  const middlewareAPI = { controllerId: 'AnalysesController', operationId: 'getQueryAggregate' };
  const nextHandler = batchMiddleware()(middlewareAPI);

  it('must call only once the operation but call every caller callbacks at the end', done => {
    const getQueryAggregate = ({queries}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const requests = [
      {input: {...analysisParams, queries: [1]}, callback: sinon.spy(), result: 2},
      {input: {...analysisParams, queries: [2]}, callback: sinon.spy(), result: 4},
      {input: {...analysisParams, queries: [3]}, callback: sinon.spy(), result: 6},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getQueryAggregateSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getQueryAggregateSpy.callCount).to.be.equal(1);
      chai.expect(getQueryAggregateSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        queries: [1, 2, 3],
      });
      chai.expect(getQueryAggregateSpy.getCall(0).args[2]).to.be.equal(options);
      done();
    }, 5);
  });

  it('must returns the operation error if given', done => {
    const apiError = 'that error';
    const getQueryAggregate = ({queries}, callback) => callback(apiError);
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const requests = [
      {input: {...analysisParams, queries: [1]}, callback: sinon.spy()},
      {input: {...analysisParams, queries: [2]}, callback: sinon.spy()},
      {input: {...analysisParams, queries: [3]}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getQueryAggregateSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(apiError);
        chai.expect(callback.getCall(0).args[1]).to.be.undefined; // eslint-disable-line no-unused-expressions
      });
      done();
    }, 5);
  });

  it('must returns an error if API returns an empty body', done => {
    const getQueryAggregate = ({queries}, callback) => callback(null);
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const requests = [
      {input: {...analysisParams, queries: [1]}, callback: sinon.spy()},
      {input: {...analysisParams, queries: [2]}, callback: sinon.spy()},
      {input: {...analysisParams, queries: [3]}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getQueryAggregateSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.deep.equal({
          ErrorMessage: 'API returned an empty body',
          ErrorCode: undefined,
        });
      });
      done();
    }, 5);
  });

  it('must returns an error if specific resource failed', done => {
    const requests = [
      {
        input: {...analysisParams, queries: [0]},
        callback: sinon.spy(),
        apiResult: {status: 200, data: 2},
        middlewareOutput: [null, 2],
      },
      {
        input: {...analysisParams, queries: [1]},
        callback: sinon.spy(),
        apiResult: {status: 500, error: 'Server error'},
        middlewareOutput: [{
          ErrorMessage: 'Server error',
          ErrorCode: 500,
        }],
      },
      {
        input: {...analysisParams, queries: [2]},
        callback: sinon.spy(),
        apiResult: {status: 200, data: 6},
        middlewareOutput: [null, 6],
      },
    ];
    const getQueryAggregate = ({queries}, callback) => {
      callback(null, queries.map(i => requests[i].apiResult));
    };
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);

    requests.forEach(({input, callback}, i) => {
      nextHandler(getQueryAggregateSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, middlewareOutput}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args).to.be.deep.equal(middlewareOutput);
      });

      done();
    }, 5);
  });

  it('must respect the queue limit', done => {
    const limitedNextHandler = batchMiddleware({
      ...DEFAULT_BATCHED_OPERATIONS,
      getQueryAggregate: {
        ...DEFAULT_BATCHED_OPERATIONS.getQueryAggregate,
        queueLimit: 2,
      },
    })(middlewareAPI);
    const getQueryAggregate = ({queries}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const requests = [
      {input: {...analysisParams, queries: [1]}, callback: sinon.spy(), result: 2},
      {input: {...analysisParams, queries: [2]}, callback: sinon.spy(), result: 4},
      {input: {...analysisParams, queries: [3]}, callback: sinon.spy(), result: 6},
    ];

    requests.forEach(({input, callback}, i) => {
      limitedNextHandler(getQueryAggregateSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getQueryAggregateSpy.callCount).to.be.equal(2);
      // First batch
      chai.expect(getQueryAggregateSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        queries: [1, 2],
      });
      chai.expect(getQueryAggregateSpy.getCall(0).args[2]).to.be.equal(options);
      // Second batch
      chai.expect(getQueryAggregateSpy.getCall(1).args[0]).to.be.deep.equal({
        ...analysisParams,
        queries: [3],
      });
      chai.expect(getQueryAggregateSpy.getCall(1).args[2]).to.be.equal(options);
      done();
    }, 5);
  });

  it('must NOT do anything on not batched operation', done => {
    const nextHandlerNotBached = batchMiddleware()({
      controllerId: 'ProjectsController',
      operationId: 'getProject',
    });

    const apiResult = 'foo';
    const getProject = (x, callback) => callback(null, apiResult);
    const getProjectSpy = sinon.spy(getProject);

    nextHandlerNotBached(getProjectSpy)(1, (error, result) => {
      chai.expect(getProjectSpy.callCount).to.be.equal(1);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(apiResult);
      done();
    });
  });
});