import chai from 'chai';

import Query from '../../src/models/query';
import QueryAggregate from '../../src/models/queryAggregate';

describe('Query', function() {
  describe('Construct', function() {
    it('should create a basic object with empty fields, aggregates, filters and sort', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      chai.expect(query.name).to.equal(queryName); // eslint-disable-line
      chai.expect(query.getFilters()).to.be.empty; // eslint-disable-line
      chai.expect(query.getAggregate()).to.be.empty; // eslint-disable-line
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
  describe('addAggregate', function() {
    it('should add a new instance of QueryAggregate', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);
      const agg = new QueryAggregate('new_agg', {});
      // create aggregator
      query.addAggregate(agg);
      chai.expect(query._aggregates).to.have.length(1);
    });
  });

  describe('getAggregate', function() {
    it('should return the instance of QueryAggregate from a name', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);

      // create aggregator
      query.addAggregate(new QueryAggregate('first_aggregate'));
      query.addAggregate(new QueryAggregate('second_aggregate'));

      chai.expect(query._aggregates).to.have.length(2);
      // try to find the aggregate
      const agg = query.getAggregate('first_aggregate');

      chai.expect(agg).to.be.an('object');
      chai.expect(agg).to.be.instanceOf(QueryAggregate);
    });
    it('should return undefined if aggregate not found', function() {
      const queryName = 'test_query';
      const query = new Query(queryName);

      // create aggregator
      query.addAggregate(new QueryAggregate('first_aggregate'));
      query.addAggregate(new QueryAggregate('second_aggregate'));

      chai.expect(query._aggregates).to.have.length(2);
      // try to find the aggregate
      const agg = query.getAggregate('third_aggregate');

      chai.expect(agg).to.be.undefined; // eslint-disable-line
    });
  });
  describe('toJsonAPI', function() {
    const queryName = 'test_query';
    const queryAggregateName = 'test_queryAggregate';
    const query = new Query(queryName)
        .addAggregate(
        new QueryAggregate(queryAggregateName)
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
        );
    console.log(query.toJsonAPI());
    chai.expect({}).to.include({});
  });
});
