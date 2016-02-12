import chai from 'chai';
import sinon from 'sinon';

import QueryRangeGroupBy from '../../src/models/QueryRangeGroupBy';


describe('QueryRangeGroupBy', function() {
  describe('constructor', function() {
    it('should create a Range Group object with field and ranges', function() {
      const field = 'delay_last_byte';
      const ranges = [
        {
          from: 0,
          to: 500,
          metadata: {
            label: 'Fast',
          },
        },
        {
          from: 500,
          to: 1000,
          metadata: {
            label: 'Quite slow',
          },
        },
        {
          from: 1000,
        },
      ];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);
      chai.expect(queryRangeGroupBy.ranges).to.be.equal(ranges);
    });

    it('should throw an error if ranges param is not an array', function() {
      const instanciation = (field, ranges) => () => new QueryRangeGroupBy(field, ranges);
      const expectedError = 'ranges must be an Array';

      chai.expect(instanciation('delay_last_byte', 'foo')).to.throw(expectedError);
      chai.expect(instanciation('delay_last_byte')).to.throw(expectedError);
    });
  });

  describe('toJsonAPI', function() {
    it('should return JSON object', function() {
      const field = 'delay_last_byte';
      const ranges = [
        {
          from: 0,
          to: 500,
          metadata: {
            label: 'Fast',
          },
        },
        {
          from: 500,
          to: 1000,
          metadata: {
            label: 'Quite slow',
          },
        },
        {
          from: 1000,
        },
      ];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);

      const json = {
        range: {
          field: 'delay_last_byte',
          ranges: [
            {
              from: 0,
              to: 500,
            },
            {
              from: 500,
              to: 1000,
            },
            {
              from: 1000,
            },
          ],
        },
      };

      chai.expect(queryRangeGroupBy.toJsonAPI()).to.deep.equal(json);
    });
  });

  describe('applyKeyReducers', function() {
    it('should not inject metadata by default', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);
      sinon.spy(queryRangeGroupBy, '_injectMetadata');

      queryRangeGroupBy.applyKeyReducers({});
      chai.expect(queryRangeGroupBy._injectMetadata.callCount).to.be.equal(0);
    });

    it('should inject metadata if specified', function() {
      const field = 'delay_last_byte';
      const ranges = [];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);
      sinon.spy(queryRangeGroupBy, '_injectMetadata');

      queryRangeGroupBy.applyKeyReducers({}, {injectMetadata: true});
      chai.expect(queryRangeGroupBy._injectMetadata.callCount).to.be.equal(1);
    });
  });

  describe('_injectMetadata', function() {
    it('should inject metadata', function() {
      const field = 'delay_last_byte';
      const ranges = [
        {
          from: 0,
          to: 500,
          metadata: {
            label: 'Fast',
          },
        },
        {
          from: 500,
          to: 1000,
          metadata: {
            label: 'Quite slow',
          },
        },
        {
          from: 1000,
        },
      ];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);

      const input = {
        from: 0,
        to: 500,
      };

      const output = {
        from: 0,
        to: 500,
        metadata: {
          label: 'Fast',
        },
      };

      chai.expect(queryRangeGroupBy._injectMetadata(input)).to.deep.equal(output);
    });

    it('should inject empty metadata if not available', function() {
      const field = 'delay_last_byte';
      const ranges = [
        {
          from: 0,
          to: 500,
          metadata: {
            label: 'Fast',
          },
        },
        {
          from: 500,
          to: 1000,
          metadata: {
            label: 'Quite slow',
          },
        },
        {
          from: 1000,
        },
      ];
      const queryRangeGroupBy = new QueryRangeGroupBy(field, ranges);

      const input = {
        from: 1000,
      };

      const output = {
        from: 1000,
        metadata: {},
      };

      chai.expect(queryRangeGroupBy._injectMetadata(input)).to.deep.equal(output);
    });
  });
});
