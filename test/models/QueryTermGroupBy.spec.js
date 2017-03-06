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

      const json = {
        distinct: {
          size: 100,
          field: 'http_code',
          order: {
            value: 'asc',
          },
        },
      };
      chai.expect(queryTermGroupBy.toJsonAPI()).to.deep.equal(json);
    });
  });

  describe('applyKeyReducers', function() {
    it('should not transform keys and inject metadata by default', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_transformTermKeys');
      sinon.spy(queryTermGroupBy, '_injectMetadata');

      queryTermGroupBy.applyKeyReducers({});
      chai.expect(queryTermGroupBy._transformTermKeys.callCount).to.be.equal(0);
      chai.expect(queryTermGroupBy._injectMetadata.callCount).to.be.equal(0);
    });

    it('should transform keys if specified', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_transformTermKeys');

      queryTermGroupBy.applyKeyReducers({}, {transformTermKeys: true});
      chai.expect(queryTermGroupBy._transformTermKeys.callCount).to.be.equal(1);
    });

    it('should inject metadata if specified and if keys are requested to be transformed', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryTermGroupBy = new QueryTermGroupBy(field, ranges);
      sinon.spy(queryTermGroupBy, '_injectMetadata');

      queryTermGroupBy.applyKeyReducers({}, {injectMetadata: true});
      queryTermGroupBy.applyKeyReducers({}, {transformTermKeys: true, injectMetadata: true});
      chai.expect(queryTermGroupBy._injectMetadata.callCount).to.be.equal(1);
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
