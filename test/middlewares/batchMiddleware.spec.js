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
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(null, urlsAggsQueries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, urlsAggsQueries: [1]}, callback: sinon.spy(), result: [2]},
      {input: {...analysisParams, urlsAggsQueries: [2]}, callback: sinon.spy(), result: [4]},
      {input: {...analysisParams, urlsAggsQueries: [3]}, callback: sinon.spy(), result: [6]},
    ];

    requests.forEach(({input, callback}) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
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
        urlsAggsQueries: [1, 2, 3],
      });
      done();
    }, 0);
  });

  it('must handle calls with multiple queries', done => {
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(null, urlsAggsQueries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, urlsAggsQueries: [1, 2]}, callback: sinon.spy(), result: [2, 4]},
      {input: {...analysisParams, urlsAggsQueries: [3, 4]}, callback: sinon.spy(), result: [6, 8]},
      {input: {...analysisParams, urlsAggsQueries: [5, 6]}, callback: sinon.spy(), result: [10, 12]},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
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
        urlsAggsQueries: [1, 2, 3, 4, 5, 6],
      });
      done();
    }, 0);
  });

  it('must batch what can be batch together', done => {
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(null, urlsAggsQueries.map(v => ({
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
          urlsAggsQueries: [1],
        },
        callback: sinon.spy(),
        result: [2],
      },
      {
        input: {
          username: 'botify',
          projectSlug: 'botify.fr',
          analysisSlug: 'thatAnalysis',
          urlsAggsQueries: [2],
        },
        callback: sinon.spy(),
        result: [4],
      },
      {
        input: {
          username: 'botify',
          projectSlug: 'botify.com',
          analysisSlug: 'thatAnalysis2',
          urlsAggsQueries: [3],
        },
        callback: sinon.spy(),
        result: [6],
      },
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
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
        urlsAggsQueries: [1],
      });

      // Second batch
      chai.expect(getUrlsAggsSpy.getCall(1).args[0]).to.be.deep.equal({
        username: 'botify',
        projectSlug: 'botify.fr',
        analysisSlug: 'thatAnalysis',
        urlsAggsQueries: [2],
      });

      // Thrid batch
      chai.expect(getUrlsAggsSpy.getCall(2).args[0]).to.be.deep.equal({
        username: 'botify',
        projectSlug: 'botify.com',
        analysisSlug: 'thatAnalysis2',
        urlsAggsQueries: [3],
      });
      done();
    }, 0);
  });

  it('must not batch when it is specified in option', done => {
    const getQueryAggregate = ({urlsAggsQueries}, callback) => callback(null, urlsAggsQueries.map(v => ({
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
          urlsAggsQueries: [1],
        },
        callback: sinon.spy(),
        result: [2],
      },
      {
        input: {
          ...analysisParams,
          urlsAggsQueries: [2],
        },
        callback: sinon.spy(),
        result: [4],
      },
      {
        input: {
          ...analysisParams,
          urlsAggsQueries: [3],
        },
        callback: sinon.spy(),
        result: [6],
      },
    ];

    const notBatchRequests = [
      {
        input: {
          ...analysisParams,
          urlsAggsQueries: [4],
        },
        callback: sinon.spy(),
        options: notBatchOptions,
        result: [8],
      },
      {
        input: {
          ...analysisParams,
          urlsAggsQueries: [5],
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
    setTimeout(() => {
    // If batched, getQueryAggregateSpy should be called 1 times
      chai.expect(getQueryAggregateSpyBatch.callCount).to.equal(1);
      done();
    }, 0);
  });

  it('must returns the operation error if given', done => {
    const apiError = 'that error';
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(apiError);
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, urlsAggsQueries: [1]}, callback: sinon.spy()},
      {input: {...analysisParams, urlsAggsQueries: [2]}, callback: sinon.spy()},
      {input: {...analysisParams, urlsAggsQueries: [3]}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(apiError);
        chai.expect(callback.getCall(0).args[1]).to.be.undefined; // eslint-disable-line no-unused-expressions
      });
      done();
    }, 0);
  });

  it('must returns an error if API returns an empty body', done => {
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(null);
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, urlsAggsQueries: [1]}, callback: sinon.spy()},
      {input: {...analysisParams, urlsAggsQueries: [2]}, callback: sinon.spy()},
      {input: {...analysisParams, urlsAggsQueries: [3]}, callback: sinon.spy()},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
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
    }, 0);
  });

  it('must returns an error if specific resource failed', done => {
    const requests = [
      {
        input: {...analysisParams, urlsAggsQueries: [0]},
        callback: sinon.spy(),
        middlewareOutput: [null, [2]],
      },
      {
        input: {...analysisParams, urlsAggsQueries: [1]},
        callback: sinon.spy(),
        middlewareOutput: [{
          errorMessage: 'Resource 0 failed',
          errorCode: 500,
          errorResponse: {
            status: 500,
            error: {
              message: 'Server error',
              resource_index: 0,
            },
          },
        }],
      },
      {
        input: {...analysisParams, urlsAggsQueries: [2]},
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

    const getUrlsAggs = ({urlsAggsQueries}, callback) => {
      callback(null, apiResult);
    };
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, middlewareOutput}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args).to.be.deep.equal(middlewareOutput);
      });

      done();
    }, 0);
  });

  it('must returns an error if specific item failed', done => {
    const requests = [
      {
        input: {...analysisParams, urlsAggsQueries: [0, 2]},
        callback: sinon.spy(),
        middlewareOutput: [{
          errorMessage: 'Resource 1 failed',
          errorCode: 400,
          errorResponse: {
            status: 400,
            error: {
              message: 'Query is not valid',
              error_code: 34,
              resource_index: 1,
            },
          },
        }],
      },
      {
        input: {...analysisParams, urlsAggsQueries: [2]},
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

    const getUrlsAggs = ({urlsAggsQueries}, callback) => {
      callback(null, apiResult);
    };
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);

    requests.forEach(({input, callback}, i) => {
      nextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, middlewareOutput}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args).to.be.deep.equal(middlewareOutput);
      });

      done();
    }, 0);
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
    const getUrlsAggs = ({urlsAggsQueries}, callback) => callback(null, urlsAggsQueries.map(v => ({
      status: 200,
      data: v * 2,
    })));
    const getUrlsAggsSpy = sinon.spy(getUrlsAggs);
    const requests = [
      {input: {...analysisParams, urlsAggsQueries: [1]}, callback: sinon.spy(), result: [2]},
      {input: {...analysisParams, urlsAggsQueries: [2]}, callback: sinon.spy(), result: [4]},
      {input: {...analysisParams, urlsAggsQueries: [3]}, callback: sinon.spy(), result: [6]},
    ];

    requests.forEach(({input, callback}, i) => {
      limitedNextHandler(getUrlsAggsSpy)(input, callback, options);
    });

    setTimeout(() => {
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
        urlsAggsQueries: [1, 2],
      });
      // Second batch
      chai.expect(getUrlsAggsSpy.getCall(1).args[0]).to.be.deep.equal({
        ...analysisParams,
        urlsAggsQueries: [3],
      });
      done();
    }, 0);
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

  it('must wait a specific amount of time before calling operation if specified in options', done => {
    const delayedMiddleware = batchMiddleware({ timeout: 10 })(middlewareAPI);
    const func = (params, callback) => callback(null, {});
    const spiedFunc = sinon.spy(func);
    const spiedCallback = sinon.spy();
    const param = {...analysisParams, urlsAggsQueries: []};

    delayedMiddleware(spiedFunc)(param, spiedCallback);
    delayedMiddleware(spiedFunc)(param, spiedCallback);
    delayedMiddleware(spiedFunc)(param, spiedCallback);
    delayedMiddleware(spiedFunc)(param, spiedCallback);

    // Must not been called just after
    chai.expect(spiedFunc.callCount).to.be.equal(0);
    chai.expect(spiedCallback.callCount).to.be.equal(0);

    // Neither at the end of event loop
    setImmediate(() => {
      chai.expect(spiedFunc.callCount).to.be.equal(0);
      chai.expect(spiedCallback.callCount).to.be.equal(0);
    });

    setTimeout(() => {
      chai.expect(spiedFunc.callCount).to.be.equal(1);
      chai.expect(spiedCallback.callCount).to.be.equal(4);

      done();
    }, 10);
  });
});
