import chai from 'chai';
import sinon from 'sinon';

import QueryTermGroupBy from '../../src/models/QueryTermGroupBy';


describe('QueryTermGroupBy', function() {
  describe('constructor', function() {
    it('should create a Term Group object with field and terms', function() {
      const field = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: {
            label: 'Redirections',
          },
        },
        { value: 404,
          metadata: {
            label: 'Page Not Found',
          },
        },
      ];
      const queryTermGroupBy = new QueryTermGroupBy(field, terms);

      chai.expect(queryTermGroupBy.terms).to.be.equal(terms);
    });

    it('should throw an error if terms param is not an array', function() {
      const instanciation = (field, terms) => () => new QueryTermGroupBy(field, terms);
      const expectedError = 'terms must be an Array';

      chai.expect(instanciation('delay_last_byte', 'foo')).to.throw(expectedError);
      chai.expect(instanciation('delay_last_byte')).to.not.throw(expectedError);
    });
  });

  describe('toJsonAPI', function() {
    it('should return JSON object', function() {
      const field = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: {
            label: 'Redirections',
          },
        },
        { value: 404,
          metadata: {
            label: 'Page Not Found',
          },
        },
      ];
      const queryTermGroupBy = new QueryTermGroupBy(field, terms);

      const json = 'http_code';
      chai.expect(queryTermGroupBy.toJsonAPI()).to.deep.equal(json);
    });
  });

  describe('applyKeyReducers', function() {
    it('should inject transform keys, inject metadata and normalizeBoolean by default', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_normalizeBoolean');
      sinon.spy(queryTermGroupBy, '_transformTermKeys');
      sinon.spy(queryTermGroupBy, '_injectMetadata');

      queryTermGroupBy.applyKeyReducers({});
      chai.expect(queryTermGroupBy._normalizeBoolean.callCount).to.be.equal(1);
      chai.expect(queryTermGroupBy._transformTermKeys.callCount).to.be.equal(1);
      chai.expect(queryTermGroupBy._injectMetadata.callCount).to.be.equal(1);
    });

    it('should not normalize boolean if specified', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_normalizeBoolean');

      queryTermGroupBy.applyKeyReducers({}, {normalizeBoolean: false});
      chai.expect(queryTermGroupBy._normalizeBoolean.callCount).to.be.equal(0);
    });

    it('should not transform keys if specified', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_transformTermKeys');

      queryTermGroupBy.applyKeyReducers({}, {transformTermKeys: false});
      chai.expect(queryTermGroupBy._transformTermKeys.callCount).to.be.equal(0);
    });

    it('should not inject metadata if specified or if keys are not transformed', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_injectMetadata');

      queryTermGroupBy.applyKeyReducers({}, {injectMetadata: false});
      queryTermGroupBy.applyKeyReducers({}, {transformTermKeys: false, injectMetadata: true});
      chai.expect(queryTermGroupBy._injectMetadata.callCount).to.be.equal(0);
    });
  });

  describe('_normalizeBoolean', function() {
    it('should normalize boolean', function() {
      const queryTermGroupBy = new QueryTermGroupBy('', []);

      chai.expect(queryTermGroupBy._normalizeBoolean('T')).to.deep.equal(true);
      chai.expect(queryTermGroupBy._normalizeBoolean('F')).to.deep.equal(false);
      chai.expect(queryTermGroupBy._normalizeBoolean('foo')).to.deep.equal('foo');
    });

    it('should not transform key if no a boolean', function() {
      const queryTermGroupBy = new QueryTermGroupBy('', []);

      chai.expect(queryTermGroupBy._normalizeBoolean('foo')).to.deep.equal('foo');
    });
  });

  describe('_transformTermKeys', function() {
    it('should transform key to Object', function() {
      const queryTermGroupBy = new QueryTermGroupBy('', []);

      chai.expect(queryTermGroupBy._transformTermKeys(false)).to.deep.equal({ value: false });
      chai.expect(queryTermGroupBy._transformTermKeys(300)).to.deep.equal({ value: 300 });
      chai.expect(queryTermGroupBy._transformTermKeys('foo')).to.deep.equal({ value: 'foo' });
    });
  });

  describe('_injectMetadata', function() {
    it('should inject metadata', function() {
      const field = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: { label: 'Redirections' },
        },
        {
          value: 404,
        },
      ];
      const queryTermGroupBy = new QueryTermGroupBy(field, terms);

      const input = {
        value: 301,
      };

      const output = {
        value: 301,
        metadata: { label: 'Redirections' },
      };

      chai.expect(queryTermGroupBy._injectMetadata(input)).to.deep.equal(output);
    });

    it('should inject empty metadata if not available', function() {
      const field = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: { label: 'Redirections' },
        },
        {
          value: 404,
        },
      ];
      const queryTermGroupBy = new QueryTermGroupBy(field, terms);

      const input = {
        value: 404,
      };

      const output = {
        value: 404,
        metadata: {},
      };

      chai.expect(queryTermGroupBy._injectMetadata(input)).to.deep.equal(output);
    });
  });
});
