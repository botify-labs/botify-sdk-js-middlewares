import chai from 'chai';

import QueryAggregate from '../../src/models/queryAggregate';

describe('QueryAggregate', function() {
  describe('Construct', function() {
    it('should create a basic object with empty fields, aggregates, filters and sort', function() {
      const queryName = 'QueryAggregate';
      const queryAggregate = new QueryAggregate(queryName);
      chai.expect(queryAggregate.name).to.equal(queryName); // eslint-disable-line
      chai.expect(queryAggregate.getGroupBys()).to.be.empty; // eslint-disable-line
      chai.expect(queryAggregate.getMetrics()).to.be.empty; // eslint-disable-line
    });
  });
  describe('AddMetric', function() {
    it('should add a new field on the list', function() {
      const queryName = 'test_query';
      const queryAggregate = new QueryAggregate(queryName);
      const operation = 'count';
      const field = null;
      queryAggregate.addMetric(operation, field);
      chai.expect(queryAggregate.getMetrics()).to.have.length(1);
      chai.expect(queryAggregate.getMetrics()).to.include({[operation]: field});
    });
  });
  describe('addTermGroupBy', function() {
    it('should add a new Term Group on the list', function() {
      const queryName = 'test_query';
      const queryAggregate = new QueryAggregate(queryName);
      const field = 'http_code';
      const terms = [{ value: 301, metadata: { label: 'Redirections' }}, { value: 404, metadata: { label: 'Page Not Found' }}];
      queryAggregate.addTermGroupBy(field, terms);
      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms});
    });
  });

  describe('addGroupBy', function() {
    it('should add a new Group by on the list', function() {
      const queryName = 'test_query';
      const queryAggregate = new QueryAggregate(queryName);
      const field = 'http_code';
      queryAggregate.addGroupBy(field);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms: []});
    });
  });

  describe('combine addGroupBy && addTermGroupBy', function() {
    it('should combine two add GroupBy Function', function() {
      const queryName = 'test_query';
      const queryAggregate = new QueryAggregate(queryName);
      const field = 'http_code';
      const terms = [{ value: 301, metadata: { label: 'Redirections' }}, { value: 404, metadata: { label: 'Page Not Found' }}];
      queryAggregate.addGroupBy(field)
      .addTermGroupBy(field, terms);

      chai.expect(queryAggregate.getGroupBys()).to.have.length(2);
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms: []});
      chai.expect(queryAggregate.getGroupBys()).to.include({field, terms});
    });
  });
});
