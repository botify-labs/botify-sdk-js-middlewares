import chai from 'chai';

import Query from '../../src/models/query';
import QueryAggregate from '../../src/models/queryAggregate';

describe('Query', function() {
  describe('Constructor', function() {
    it('should create a basic object with empty fields, aggregates, filters and sort', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      chai.expect(query.name).to.equal(queryName);
      chai.expect(query.getFilters()).to.be.empty;
      chai.expect(query.getAggregates()).to.be.empty;
    });
  });

  describe('setFilters', function() {
    it('should set a filter object on the query', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      const filters = {and: []};
      query.setFilters(filters);
      chai.expect(query.getFilters()).to.deep.equal(filters);
    });
  });

  describe('setFilters Error', function() {
    it('should throw an error', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      const error = 'filters must be an object';
      // create aggregator
      chai.expect(query.setFilters.bind(null, 'filter')).to.throw(error);
    });
  });

  describe('addAggregate', function() {
    it('should add a new instance of QueryAggregate', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      const agg = new QueryAggregate('new_agg');
      // create aggregator
      query.addAggregate(agg);
      chai.expect(query.getAggregates()).to.have.length(1);
    });
  });

  describe('addAggregate Error', function() {
    it('should throw an error', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      const error = 'aggregate must be an instance of QueryAggregate';
      // create aggregator
      chai.expect(query.addAggregate.bind(null, 'agg')).to.throw(error);
    });
  });

  describe('getAggregates', function() {
    it('should return the instance of QueryAggregate from a name', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);

      // create aggregator
      query.addAggregate(new QueryAggregate('first_aggregate'));
      query.addAggregate(new QueryAggregate('second_aggregate'));

      chai.expect(query.getAggregates()).to.have.length(2);
    });
  });

  describe('toJsonAPI', function() {
    it('should return JSON object', function() {
      const queryName = 'test_query';
      const query = new Query(queryName)
        .addAggregate(
          new QueryAggregate()
            .addTermGroupBy('http_code', [
              {
                value: 301,
                metadata: { label: 'Redirections' },
              },
              {
                value: 404,
                metadata: { label: 'Page Not Found' },
              },
            ])
            .addRangeGroupBy('delay_last_byte', [
              {
                from: 0,
                to: 500,
                metadata: { label: 'Fast' },
              },
              {
                from: 500,
                to: 1000,
                metadata: { label: 'Quite slow' },
              },
              {
                from: 1000,
              },
            ])
            .addMetric('count')
            .addMetric('avg', 'delay_last_byte')
        )
        .setFilters({
          field: 'strategic.is_strategic',
          predicate: 'eq',
          value: true,
        });
      const json = {
        aggs: [
          {
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
          },
        ],
        filters: {
          field: 'strategic.is_strategic',
          predicate: 'eq',
          value: true,
        },
      };
      chai.expect(query.toJsonAPI()).to.deep.equal(json);
    });
  });
});
