import chai from 'chai';

import QueryTermGroupBy from '../../src/models/queryTermGroupBy';

describe('QueryTermGroupBy', function() {
  describe('Constructor', function() {
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
});
