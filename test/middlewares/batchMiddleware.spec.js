import chai from 'chai';
import sinon from 'sinon';

import batchMiddleware from '../../src/middlewares/batchMiddleware';


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
    const getQueryAggregate = ({queries}, callback) => callback(null, {
      status: 200,
      data: queries.map(v => v * 2),
    });
    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const requests = [
      {input: {...analysisParams, queries: [1]}, callback: sinon.spy(), output: 2},
      {input: {...analysisParams, queries: [2]}, callback: sinon.spy(), output: 4},
      {input: {...analysisParams, queries: [3]}, callback: sinon.spy(), output: 6},
    ];

    requests.forEach(({input, callback}, i) => {
      nextHandler(getQueryAggregateSpy)(input, callback, options);
    });
    setTimeout(() => {
      // Expect each callback to be called with rights params
      requests.forEach(({callback, output}) => {
        chai.expect(callback.callCount).to.be.equal(1);
        chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
        chai.expect(callback.getCall(0).args[1]).to.be.equal(output);
      });

      // Expect operation to be called only once (MOST IMPORTANT)
      chai.expect(getQueryAggregateSpy.callCount).to.be.equal(1);
      chai.expect(getQueryAggregateSpy.getCall(0).args[0]).to.be.deep.equal({
        ...analysisParams,
        queries: [1, 2, 3],
      });
      chai.expect(getQueryAggregateSpy.getCall(0).args[2]).to.be.equal(options);
      done();
    }, 100);
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
