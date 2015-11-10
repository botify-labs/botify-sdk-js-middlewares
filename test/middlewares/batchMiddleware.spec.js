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

  const middlewareAPI = { controllerId: 'AnalysisController', operationId: 'getUrlsAggs' };
  const nextHandler = batchMiddleware()(middlewareAPI);

  it('must call only once the operation but call every caller callbacks at the end', done => {
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, UrlsAggsQuery: {queries: [1]}}, callback: sinon.spy(), result: [2]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [2]}}, callback: sinon.spy(), result: [4]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [3]}}, callback: sinon.spy(), result: [6]},
    ];

    requests.forEach(({input, callback}) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.deep.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getUrlsAggsSpy.callCount).to.be.equal(1);
      chai.expect(getUrlsAggsSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        UrlsAggsQuery: {queries: [1, 2, 3]},
      });
      done();
    });
  });

  it('must handle calls with multiple queries', done => {
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, UrlsAggsQuery: {queries: [1, 2]}}, callback: sinon.spy(), result: [2, 4]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [3, 4]}}, callback: sinon.spy(), result: [6, 8]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [5, 6]}}, callback: sinon.spy(), result: [10, 12]},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.deep.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getUrlsAggsSpy.callCount).to.be.equal(1);
      chai.expect(getUrlsAggsSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        UrlsAggsQuery: {queries: [1, 2, 3, 4, 5, 6]},
      });
      done();
    });
  });

  it('must batch what can be batch together', done => {
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {
        input: {
          username: 'botify',
          projectSlug: 'botify.com',
          analysisSlug: 'thatAnalysis',
          UrlsAggsQuery: {queries: [1]},
        },
        callback: sinon.spy(),
        result: [2],
      },
      {
        input: {
          username: 'botify',
          projectSlug: 'botify.fr',
          analysisSlug: 'thatAnalysis',
          UrlsAggsQuery: {queries: [2]},
        },
        callback: sinon.spy(),
        result: [4],
      },
      {
        input: {
          username: 'botify',
          projectSlug: 'botify.com',
          analysisSlug: 'thatAnalysis2',
          UrlsAggsQuery: {queries: [3]},
        },
        callback: sinon.spy(),
        result: [6],
      },
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.deep.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getUrlsAggsSpy.callCount).to.be.equal(3);
      // First batch
      chai.expect(getUrlsAggsSpy.getCall(0).args[0]).to.be.deep.equal({
        username: 'botify',
        projectSlug: 'botify.com',
        analysisSlug: 'thatAnalysis',
        UrlsAggsQuery: {queries: [1]},
      });

      // Second batch
      chai.expect(getUrlsAggsSpy.getCall(1).args[0]).to.be.deep.equal({
        username: 'botify',
        projectSlug: 'botify.fr',
        analysisSlug: 'thatAnalysis',
        UrlsAggsQuery: {queries: [2]},
      });

      // Thrid batch
      chai.expect(getUrlsAggsSpy.getCall(2).args[0]).to.be.deep.equal({
        username: 'botify',
        projectSlug: 'botify.com',
        analysisSlug: 'thatAnalysis2',
        UrlsAggsQuery: {queries: [3]},
      });
      done();
    });
  });

  it('must not batch when it is specified in option', done => {
    const getQueryAggregate = ({UrlsAggsQuery: {queries}}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getQueryAggregateSpyBatch = sinon.spy(getQueryAggregate);
    const getQueryAggregateSpyNotBatch = sinon.spy(getQueryAggregate);
    const notBatchOptions = {
      ...options,
      batch: false,
    };
    const batchRequests = [
      {
        input: {
          ...analysisParams,
          UrlsAggsQuery: {queries: [1]},
        },
        callback: sinon.spy(),
        result: [2],
      },
      {
        input: {
          ...analysisParams,
          UrlsAggsQuery: {queries: [2]},
        },
        callback: sinon.spy(),
        result: [4],
      },
      {
        input: {
          ...analysisParams,
          UrlsAggsQuery: {queries: [3]},
        },
        callback: sinon.spy(),
        result: [6],
      },
    ];

    const notBatchRequests = [
      {
        input: {
          ...analysisParams,
          UrlsAggsQuery: {queries: [4]},
        },
        callback: sinon.spy(),
        options: notBatchOptions,
        result: [8],
      },
      {
        input: {
          ...analysisParams,
          UrlsAggsQuery: {queries: [5]},
        },
        callback: sinon.spy(),
        options: notBatchOptions,
        result: [10],
      },
    ];

    notBatchRequests.forEach(({input, callback}) => {
      nextHandler(getQueryAggregateSpyNotBatch)(input, callback, notBatchOptions);
    });
    // If not batch getQueryAggregateSpy should be called 2 times
    chai.expect(getQueryAggregateSpyNotBatch.callCount).to.equal(2);

    batchRequests.forEach(({input, callback}) => {
      nextHandler(getQueryAggregateSpyBatch)(input, callback, options);
    });

    // Batched request are called on next tick so wait it
    setImmediate(() => {
    // If batched, getQueryAggregateSpy should be called 1 times
      chai.expect(getQueryAggregateSpyBatch.callCount).to.equal(1);
      done();
    });
  });

  it('must returns the operation error if given', done => {
    const apiError = 'that error';
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(apiError);
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, UrlsAggsQuery: {queries: [1]}}, callback: sinon.spy()},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [2]}}, callback: sinon.spy()},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [3]}}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(apiError);
        chai.expect(callback.getCall(0).args[1]).to.be.undefined; // eslint-disable-line no-unused-expressions
      });
      done();
    });
  });

  it('must returns an error if API returns an empty body', done => {
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(null);
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, UrlsAggsQuery: {queries: [1]}}, callback: sinon.spy()},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [2]}}, callback: sinon.spy()},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [3]}}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.deep.equal({
          errorMessage: 'API returned an empty body',
          errorCode: 200,
          errorResponse: undefined,
        });
      });
      done();
    });
  });

  it('must returns an error if specific resource failed', done => {
    const requests = [
      {
        input: {...analysisParams, UrlsAggsQuery: {queries: [0]}},
        callback: sinon.spy(),
        middlewareOutput: [null, [2]],
      },
      {
        input: {...analysisParams, UrlsAggsQuery: {queries: [1]}},
        callback: sinon.spy(),
        middlewareOutput: [{
          errorMessage: 'Resource 0 failed',
          errorCode: 500,
          resourceError: {
            message: 'Server error',
            errorCode: undefined,
            index: 0,
          },
        }],
      },
      {
        input: {...analysisParams, UrlsAggsQuery: {queries: [2]}},
        callback: sinon.spy(),
        middlewareOutput: [null, [6]],
      },
    ];
    const apiResult = [
      {status: 200, data: 2},
      {status: 500, error: {
        message: 'Server error',
      }},
      {status: 200, data: 6},
    ];

    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => {
      callback(null, apiResult);
    };
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, middlewareOutput}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args).to.be.deep.equal(middlewareOutput);
      });

      done();
    });
  });

  it('must returns an error if specific item failed', done => {
    const requests = [
      {
        input: {...analysisParams, UrlsAggsQuery: {queries: [0, 2]}},
        callback: sinon.spy(),
        middlewareOutput: [{
          errorMessage: 'Resource 1 failed',
          errorCode: 400,
          resourceError: {
            message: 'Query is not valid',
            errorCode: 34,
            index: 1,
          },
        }],
      },
      {
        input: {...analysisParams, UrlsAggsQuery: {queries: [2]}},
        callback: sinon.spy(),
        middlewareOutput: [null, [6]],
      },
    ];
    const apiResult = [
      {status: 200, data: 2},
      {status: 400, error: {
        error_code: 34,
        message: 'Query is not valid',
      }},
      {status: 200, data: 6},
    ];

    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => {
      callback(null, apiResult);
    };
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, middlewareOutput}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args).to.be.deep.equal(middlewareOutput);
      });

      done();
    });
  });

  it('must respect the queue limit', done => {
    const limitedNextHandler = batchMiddleware({
      batchedOperations: [
        {
          ...DEFAULT_BATCHED_OPERATIONS[0],
          queueLimit: 2,
        },
      ],
    })(middlewareAPI);
    const getUrlsAggs = ({UrlsAggsQuery: {queries}}, callback) => callback(null, queries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, UrlsAggsQuery: {queries: [1]}}, callback: sinon.spy(), result: [2]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [2]}}, callback: sinon.spy(), result: [4]},
      {input: {...analysisParams, UrlsAggsQuery: {queries: [3]}}, callback: sinon.spy(), result: [6]},
    ];

    requests.forEach(({input, callback}, i) => {
      limitedNextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setImmediate(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, result}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.deep.equal(result);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getUrlsAggsSpy.callCount).to.be.equal(2);
      // First batch
      chai.expect(getUrlsAggsSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        UrlsAggsQuery: {queries: [1, 2]},
      });
      // Second batch
      chai.expect(getUrlsAggsSpy.getCall(1).args[0]).to.be.deep.equal({
        ...analysisParams,
        UrlsAggsQuery: {queries: [3]},
      });
      done();
    });
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
