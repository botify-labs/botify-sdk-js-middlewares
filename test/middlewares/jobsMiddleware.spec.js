import chai from 'chai';
import sinon from 'sinon';

import jobsMiddleware from '../../src/middlewares/jobsMiddleware';

describe('jobsMiddleware', () => {
  const middlewareConfig = {
    jobs: [
      {
        create: { controllerId: 'controller', operationId: 'create' },
        poll: { controllerId: 'controller', operationId: 'poll', jobIdKey: 'jobIdKey' },
      },
    ],
    pollInterval: 10,
  };

  it('should poll API', done => {
    const jobId = 3564;
    const jobResult = { koo: 'fit' };

    // Create Opeation that just return the job id.
    const createOperation = (params, callback) => callback(null, { job_id: jobId });
    const spiedCreateOperation = sinon.spy(createOperation);

    // Poll Operation that return job result at third call.
    let pollCallCount = 0;
    const pollOperation = (params, callback) => {
      pollCallCount++;
      callback(null, {
        job_status: pollCallCount > 2 ? 'DONE' : 'IN_PROGRESS',
        results: pollCallCount > 2 && jobResult,
      });
    };
    const spiedPollOperation = sinon.spy(pollOperation);

    const middlewareAPI = {
      controllerId: 'controller',
      operationId: 'create',
      baseSdk: {
        controller: {
          poll: spiedPollOperation,
        },
      },
    };
    const middleware = jobsMiddleware(middlewareConfig)(middlewareAPI);

    const params = { foo: 'bar' };
    const options = { bot: 'ify' };

    middleware(spiedCreateOperation)(params, (err, result) => {
      chai.expect(spiedCreateOperation.callCount).to.be.equal(1);
      chai.expect(spiedCreateOperation.getCall(0).args[0]).to.deep.equal(params);
      chai.expect(spiedCreateOperation.getCall(0).args[2]).to.deep.equal(options);

      chai.expect(spiedPollOperation.callCount).to.be.equal(3);
      chai.expect(spiedPollOperation.getCall(0).args[0]).to.deep.equal({ ...params, jobIdKey: jobId });

      chai.expect(err).to.be.null;
      chai.expect(result).to.deep.equal(jobResult);
      done();
    }, options);
  });

  it('should returns an error if job creation failed', done => {
    // Create Opeation that returns an error.
    const createOperation = (params, callback) => callback({ errorMessage: 'it bugs somewhere' });
    const spiedCreateOperation = sinon.spy(createOperation);

    const middlewareAPI = {
      controllerId: 'controller',
      operationId: 'create',
    };
    const middleware = jobsMiddleware(middlewareConfig)(middlewareAPI);

    const params = { foo: 'bar' };
    const options = { bot: 'ify' };

    middleware(spiedCreateOperation)(params, (err, result) => {
      chai.expect(err).to.deep.equal({
        errorMessage: 'Error while creating job',
      });
      done();
    }, options);
  });

  it('should returns an error if poll failed', done => {
    const jobId = 3564;

    // Create Opeation that just return the job id.
    const createOperation = (params, callback) => callback(null, { job_id: jobId });
    const spiedCreateOperation = sinon.spy(createOperation);

    // Poll Operation that return an error.
    const pollOperation = (params, callback) => callback({ errorMessage: 'it bugs somewhere' });
    const spiedPollOperation = sinon.spy(pollOperation);

    const middlewareAPI = {
      controllerId: 'controller',
      operationId: 'create',
      baseSdk: {
        controller: {
          poll: spiedPollOperation,
        },
      },
    };
    const middleware = jobsMiddleware(middlewareConfig)(middlewareAPI);

    const params = { foo: 'bar' };
    const options = { bot: 'ify' };

    middleware(spiedCreateOperation)(params, (err, result) => {
      chai.expect(err).to.deep.equal({
        errorMessage: 'Error while polling result',
      });
      done();
    }, options);
  });

  it('should not do anything if not a job operation', () => {
    const getSomeCoffee = (params, callback) => callback(null, { coffee: 22323 });
    const spiedGetSomeCoffee = sinon.spy(getSomeCoffee);

    const middlewareAPI = {
      controllerId: 'controller',
      operationId: 'getSomeCoffee',
    };
    const middleware = jobsMiddleware(middlewareConfig)(middlewareAPI);

    const params = { foo: 'bar' };
    const callback = sinon.spy(callback);
    const options = { bot: 'ify' };

    middleware(spiedGetSomeCoffee)(params, callback, options);
    chai.expect(spiedGetSomeCoffee.callCount).to.be.equal(1);
    chai.expect(spiedGetSomeCoffee.getCall(0).args).to.deep.equal([params, callback, options]);
  });
});
