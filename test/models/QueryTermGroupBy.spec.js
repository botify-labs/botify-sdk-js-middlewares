import chai from 'chai';

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

      const json = 'http_code';
      chai.expect(queryTermGroupBy.toJsonAPI()).to.deep.equal(json);
    });
  });
});
