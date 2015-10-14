import chai from 'chai';

import QueryRangeGroupBy from '../../src/models/queryRangeGroupBy';

describe('QueryRangeGroupBy', function() {
  describe('Constructor', function() {
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
