import chai from 'chai';
import 'mock-local-storage';
import lscache from 'ls-cache';

import flushLocalStorage, { LSCACHE_DATA_MODEL_VERSION_ID } from '../../src/utils/flushLocalStorage';


describe('lscacheMiddleware', () => {
  before(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('must flush the localStorage if data model version changed', () => {
    const previousVersion = '0.0.0';
    const newVersion = '0.0.1';

    localStorage.setItem(LSCACHE_DATA_MODEL_VERSION_ID, previousVersion);
    localStorage.setItem('foo', 'bar');
    lscache.set('boo', 'bi');

    chai.expect(localStorage.length).to.be.equal(3);

    flushLocalStorage(newVersion);
    chai.expect(localStorage.length).to.be.equal(1);
    chai.expect(localStorage.getItem(LSCACHE_DATA_MODEL_VERSION_ID)).to.be.equal(newVersion);
  });

  it('must NOT lush the localStorage if data model version did not changed', () => {
    const previousVersion = '0.0.1';
    const newVersion = '0.0.1';

    localStorage.setItem(LSCACHE_DATA_MODEL_VERSION_ID, previousVersion);
    localStorage.setItem('foo', 'bar');
    lscache.set('boo', 'bi');

    chai.expect(localStorage.length).to.be.equal(3);

    flushLocalStorage(newVersion);
    chai.expect(localStorage.length).to.be.equal(3);
    chai.expect(localStorage.getItem(LSCACHE_DATA_MODEL_VERSION_ID)).to.be.equal(newVersion);
  });
});
