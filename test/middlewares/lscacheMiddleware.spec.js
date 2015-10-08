import chai from 'chai';
import sinon from 'sinon';
import 'mock-local-storage';
import lscache from 'ls-cache';

import lscacheMiddleware, {computeItemCacheKey, lscacheBucket} from '../../src/middlewares/lscacheMiddleware';


describe('lscacheMiddleware', () => {
  const nextHandler = lscacheMiddleware();

  before(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('must change store in local storage result if option cache == true', done => {
    const params = 'foo';
    const itemValue = 1000;
    const itemKey = computeItemCacheKey(params);

    const fetchX = (x, callback) => callback(null, itemValue);
    let spy = sinon.spy(fetchX);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      chai.expect(spy.callCount).to.be.equal(1);
      chai.expect(lscacheBucket.get(itemKey)).to.be.equal(itemValue);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(itemValue);
      done();
    }, {cache: true});
  });

  it('must retrive value from local storage if available if option cache == true', done => {
    const params = 'foo';
    const itemValue = 1000;
    const itemKey = computeItemCacheKey(params);

    const fetchX = (x, callback) => callback(null, itemValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscacheBucket.set(itemKey, itemValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const itemKey = computeItemCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(0);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(itemValue);
      done();
    }, {cache: true});
  });

  it('must not retrive value from local storage or store it when received, if option cache == false', done => {
    const params = 'foo';
    const itemValue = 1000;
    const itemKey = computeItemCacheKey(params);

    const fetchX = (x, callback) => callback(null, itemValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscacheBucket.set(itemKey, itemValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const itemKey = computeItemCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(1);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(itemValue);
      done();
    });
  });

  it('must not retrive value from local storage, if option invalidate == true', done => {
    const params = 'foo';
    const itemValue = 1000;
    const itemKey = computeItemCacheKey(params);

    const fetchX = (x, callback) => callback(null, itemValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscacheBucket.set(itemKey, itemValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const itemKey = computeItemCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(1);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(itemValue);
      done();
    }, {cache: true, invalidate: true});
  });

});
