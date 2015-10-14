import chai from 'chai';

import QueryRangeGroupBy from '../../src/models/queryRangeGroupBy';


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
});
