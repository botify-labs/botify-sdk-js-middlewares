import chai from 'chai';
import sinon from 'sinon';
import lscache from 'lscache';

import lscacheMiddleware, {computeCacheKey} from '../../src/middlewares/lscacheMiddleware';


describe('lscacheMiddleware', () => {
  const nextHandler = lscacheMiddleware();

  before(() => {
    //Mock lscache
    let storage = {};
    lscache.set = (key, value) => {
      storage[key] = value || '';
    };
    lscache.get = (key) => {
      return storage[key];
    };
    lscache.remove = (key) => {
      delete storage.key;
    };
    lscache.flush = () => {
      storage = {};
    };
  });

  afterEach(() => {
    lscache.flush();
  });

  it('must change store in local storage result if option cache == true', done => {
    const params = 'foo';
    const resourceValue = 1000;
    const cacheKey = computeCacheKey(params);

    const fetchX = (x, callback) => callback(null, resourceValue);
    let spy = sinon.spy(fetchX);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      chai.expect(spy.callCount).to.be.equal(1);
      chai.expect(lscache.get(cacheKey)).to.be.equal(resourceValue);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(resourceValue);
      done();
    }, {cache: true});
  });

  it('must retrive value from local storage if available if option cache == true', done => {
    const params = 'foo';
    const resourceValue = 1000;
    const cacheKey = computeCacheKey(params);

    const fetchX = (x, callback) => callback(null, resourceValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscache.set(cacheKey, resourceValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const cacheKey = computeCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(0);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(resourceValue);
      done();
    }, {cache: true});
  });

  it('must not retrive value from local storage or store it when received, if option cache == false', done => {
    const params = 'foo';
    const resourceValue = 1000;
    const cacheKey = computeCacheKey(params);

    const fetchX = (x, callback) => callback(null, resourceValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscache.set(cacheKey, resourceValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const cacheKey = computeCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(1);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(resourceValue);
      done();
    });
  });

  it('must not retrive value from local storage, if option invalidate == true', done => {
    const params = 'foo';
    const resourceValue = 1000;
    const cacheKey = computeCacheKey(params);

    const fetchX = (x, callback) => callback(null, resourceValue);
    let spy = sinon.spy(fetchX);

    //Populate local storage
    lscache.set(cacheKey, resourceValue);

    nextHandler(spy)(params, (error, result) => {
      //Expect cache
      const cacheKey = computeCacheKey(params);
      chai.expect(spy.callCount).to.be.equal(1);

      //Exect callback arguments
      chai.expect(error).to.be.null;
      chai.expect(result).to.be.equal(resourceValue);
      done();
    }, {cache: true, invalidate: true});
  });

});
