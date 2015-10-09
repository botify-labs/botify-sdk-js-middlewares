import chai from 'chai';
import sinon from 'sinon';
import 'mock-local-storage';
import lscache from 'ls-cache';

import invalidateAnalysisMiddleware, {
  invalidateAnalysisBucket,
  getAnalysisBucketId,
} from '../../src/middlewares/invalidateAnalysisMiddleware';


const CACHE_EXPIRATION = 1000;

describe('invalidateAnalysisMiddleware', () => {
  before(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const analysisParams = {
    username: 'botify',
    projectSlug: 'botify.com',
    analysisSlug: 'thatAnalysis',
  };

  it('must flush analysis cache if date last modified not stored', done => {
    const newDateLastModified = '2015-10-08T15:43:10.073Z';
    const analysisData = {date_last_modified: newDateLastModified};

    const middlewareAPI = { controllerId: 'AnalysesController', operationId: 'getAnalysis' };
    const nextHandler = invalidateAnalysisMiddleware(middlewareAPI);

    const getAnalysis = (x, callback) => callback(null, analysisData);
    const getAnalysisSpy = sinon.spy(getAnalysis);

    // Populate Storage
    const analysisBucketId = getAnalysisBucketId(analysisParams);
    const analysisBucket = lscache.createBucket(analysisBucketId);
    analysisBucket.set('AAAAAA', 111111, CACHE_EXPIRATION);
    analysisBucket.set('BBBBBB', 222222, CACHE_EXPIRATION);
    chai.expect(analysisBucket.keys().length).to.be.equal(2);

    nextHandler(getAnalysisSpy)(analysisParams, (error, result) => {
      chai.expect(getAnalysisSpy.callCount).to.be.equal(1);

      // Expect cache
      chai.expect(analysisBucket.keys().length).to.be.equal(0);
      chai.expect(invalidateAnalysisBucket.get(analysisBucketId)).to.be.equal(newDateLastModified);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(analysisData);
      done();
    });
  });

  it('must flush analysis cache if date last modified changed', done => {
    const previousDateLastModified = '2015-10-08T15:43:10.073Z';
    const newDateLastModified = '2015-10-10T15:43:10.073Z';
    const analysisData = {date_last_modified: newDateLastModified};

    const middlewareAPI = { controllerId: 'AnalysesController', operationId: 'getAnalysis' };
    const nextHandler = invalidateAnalysisMiddleware(middlewareAPI);

    const getAnalysis = (x, callback) => callback(null, analysisData);
    const getAnalysisSpy = sinon.spy(getAnalysis);

    // Populate Storage
    const analysisBucketId = getAnalysisBucketId(analysisParams);
    const analysisBucket = lscache.createBucket(analysisBucketId);
    analysisBucket.set('AAAAAA', 111111, CACHE_EXPIRATION);
    analysisBucket.set('BBBBBB', 222222, CACHE_EXPIRATION);
    chai.expect(analysisBucket.keys().length).to.be.equal(2);

    // Mock DateLastModified
    invalidateAnalysisBucket.set(analysisBucketId, previousDateLastModified, CACHE_EXPIRATION);

    nextHandler(getAnalysisSpy)(analysisParams, (error, result) => {
      chai.expect(getAnalysisSpy.callCount).to.be.equal(1);

      // Expect cache
      chai.expect(analysisBucket.keys().length).to.be.equal(0);
      chai.expect(invalidateAnalysisBucket.get(analysisBucketId)).to.be.equal(newDateLastModified);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(analysisData);
      done();
    });
  });

  it('must NOT flush analysis cache if date last modified did not changed', done => {
    const previousDateLastModified = '2015-10-08T15:43:10.073Z';
    const newDateLastModified = '2015-10-08T15:43:10.073Z';
    const analysisData = {date_last_modified: newDateLastModified};

    const middlewareAPI = { controllerId: 'AnalysesController', operationId: 'getAnalysis' };
    const nextHandler = invalidateAnalysisMiddleware(middlewareAPI);

    const getAnalysis = (x, callback) => callback(null, analysisData);
    const getAnalysisSpy = sinon.spy(getAnalysis);

    // Populate Storage
    const analysisBucketId = getAnalysisBucketId(analysisParams);
    const analysisBucket = lscache.createBucket(analysisBucketId);
    analysisBucket.set('AAAAAA', 111111, CACHE_EXPIRATION);
    analysisBucket.set('BBBBBB', 222222, CACHE_EXPIRATION);
    chai.expect(analysisBucket.keys().length).to.be.equal(2);

    // Mock DateLastModified
    invalidateAnalysisBucket.set(analysisBucketId, previousDateLastModified, CACHE_EXPIRATION);
    chai.expect(invalidateAnalysisBucket.keys().length).to.be.equal(1);

    nextHandler(getAnalysisSpy)(analysisParams, (error, result) => {
      chai.expect(getAnalysisSpy.callCount).to.be.equal(1);

      // Expect cache
      chai.expect(analysisBucket.keys().length).to.be.equal(2);
      chai.expect(invalidateAnalysisBucket.get(analysisBucketId)).to.be.equal(newDateLastModified);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(analysisData);
      done();
    });
  });

  it('must NOT flush any analysis cache if not a getAnalysis operation', done => {
    const someAnalysisDateLastModified = '2015-10-08T15:43:10.073Z';
    const middlewareAPI = { controllerId: 'ProjectsController', operationId: 'getProject' };
    const nextHandler = invalidateAnalysisMiddleware(middlewareAPI);

    const apiResult = 'foo';
    const getProject = (x, callback) => callback(null, apiResult);
    const getProjectSpy = sinon.spy(getProject);

    // Populate Storage
    const someAnalysisBucketId = 'thatAnalysisBucketId';
    const someAnalysisBucket = lscache.createBucket(someAnalysisBucketId);
    someAnalysisBucket.set('AAAAAA', 111111, CACHE_EXPIRATION);
    someAnalysisBucket.set('BBBBBB', 222222, CACHE_EXPIRATION);
    chai.expect(someAnalysisBucket.keys().length).to.be.equal(2);

    // Mock DateLastModified
    invalidateAnalysisBucket.set(someAnalysisBucketId, someAnalysisDateLastModified, CACHE_EXPIRATION);
    chai.expect(invalidateAnalysisBucket.keys().length).to.be.equal(1);

    nextHandler(getProjectSpy)(analysisParams, (error, result) => {
      chai.expect(getProjectSpy.callCount).to.be.equal(1);

      // Expect cache
      chai.expect(someAnalysisBucket.keys().length).to.be.equal(2);
      chai.expect(invalidateAnalysisBucket.get(someAnalysisBucketId)).to.be.equal(someAnalysisDateLastModified);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(apiResult);
      done();
    });
  });
});
