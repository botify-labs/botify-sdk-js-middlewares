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
      chai.expect(query.getAggregates()).to.be.empty; // eslint-disable-line
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
      chai.expect(query.getAggregates()).to.have.length(1);
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
});
