import chai from 'chai';

import QueryAggregate from '../../src/models/queryAggregate';


describe('QueryAggregate', function() {
  describe('constructor', function() {
    it('should create a basic object with empty fields, aggregates, filters and sort', function() {
      const queryAggregate = new QueryAggregate();

      chai.expect(queryAggregate.name).to.equal('');
      chai.expect(queryAggregate.getGroupBys()).to.be.empty;
      chai.expect(queryAggregate.getMetrics()).to.be.empty;
    });
  });

  describe('addMetric', function() {
    it('should add a count metric without field', function() {
      const queryAggregate = new QueryAggregate();
      const operation = 'count';
      queryAggregate.addMetric(operation);

      chai.expect(queryAggregate.getMetrics()).to.have.length(1);
      chai.expect(queryAggregate.getMetrics()).to.include({operation, field: null});
    });

    it('should add a avg metric (requiring a field)', function() {
      const queryAggregate = new QueryAggregate();
      const operation = 'avg';
      const field = 'delay_last_byte';
      queryAggregate.addMetric(operation, field);

      chai.expect(queryAggregate.getMetrics()).to.have.length(1);
      chai.expect(queryAggregate.getMetrics()).to.include({operation, field});
    });
  });

  describe('addTermGroupBy', function() {
    it('should add a new Term Group', function() {
      const queryAggregate = new QueryAggregate();
      const field = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: {
            label: 'Redirections',
          },
        },
        {
          value: 404,
          metadata: {
            label: 'Page Not Found',
          },
        },
      ];
      queryAggregate.addTermGroupBy(field, terms);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms});
    });
  });

  describe('addGroupBy', function() {
    it('should add a new Group by', function() {
      const queryAggregate = new QueryAggregate();
      const field = 'http_code';
      queryAggregate.addGroupBy(field);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms: []});
    });
  });

  describe('addRangeGroupBy', function() {
    it('should add a new RangeGroup', function() {
      const queryAggregate = new QueryAggregate();
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
      queryAggregate.addRangeGroupBy(field, ranges);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, ranges});
    });
  });

  describe('combine addRangeGroupBy && addTermGroupBy', function() {
    it('should combine Range GroupBy add Term GroupBy', function() {
      const queryAggregate = new QueryAggregate();
      const termField = 'http_code';
      const terms = [
        {
          value: 301,
          metadata: {
            label: 'Redirections',
          },
        },
        {
          value: 404,
          metadata: {
            label: 'Page Not Found',
          },
        },
      ];

      const rangeField = 'delay_last_byte';
      const ranges = [
        { from: 0,
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
      queryAggregate
        .addTermGroupBy(termField, terms)
        .addRangeGroupBy(rangeField, ranges);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(2);
      chai.expect(queryAggregate.getGroupBys()).to.include({field: rangeField, ranges});
      chai.expect(queryAggregate.getGroupBys()).to.include({field: termField, terms});
    });
  });

  describe('toJsonAPI', function() {
    it('should return JSON object', function() {
      const queryAggregate = new QueryAggregate()
      .addTermGroupBy('http_code',
        [
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
        ]
      )
      .addRangeGroupBy('delay_last_byte',
        [
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
        ]
      )
      .addMetric('count')
      .addMetric('avg', 'delay_last_byte');

      const json = {
        group_by: [
          'http_code',
          {
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
          },
        ],
        metrics: [
          'count',
          {
            avg: 'delay_last_byte',
          },
        ],
      };

      chai.expect(queryAggregate.toJsonAPI()).to.deep.equal(json);
    });
  });
});
