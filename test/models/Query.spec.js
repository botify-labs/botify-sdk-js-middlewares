import chai from 'chai';

import Query, {ApiResponseError} from '../../src/models/Query';
import QueryAggregate from '../../src/models/QueryAggregate';


describe('Query', function() {
  describe('constructor', function() {
    it('should create a basic object with empty fields, aggregates, filters and sort', function() {
      const query = new Query();
      chai.expect(query.getFilters()).to.be.null;
      chai.expect(query.getAggregates()).to.be.empty;
    });

    it('should set controllerId and operationId if provided', function() {
      const query = new Query('Controller', 'Operation');
      chai.expect(query.operation).to.deep.equal({ controllerId: 'Controller', operationId: 'Operation' });
    });

    it('should set operationId if provided alone', function() {
      const query = new Query('Operation');
      chai.expect(query.operation).to.deep.equal({ operationId: 'Operation' });
    });
  });

  describe('setFilters', function() {
    it('should set a filter object on the query', function() {
      const query = new Query();
      const filters = {and: []};
      query.setFilters(filters);

      chai.expect(query.getFilters()).to.deep.equal(filters);
    });

    it('should throw an error if filter param is not an object', function() {
      const query = new Query();
      const error = 'filters must be an object';

      chai.expect(query.setFilters.bind(null, 'filter')).to.throw(error);
    });
  });

  describe('addAggregate', function() {
    it('should add a new instance of QueryAggregate', function() {
      const query = new Query();
      const agg = new QueryAggregate();
      query.addAggregate(agg);

      chai.expect(query.getAggregates()).to.have.length(1);
    });

    it('should throw an error if aggregate param is not an instance of QueryAggregate', function() {
      const query = new Query();
      const error = 'aggregate must be an instance of QueryAggregate';

      chai.expect(query.addAggregate.bind(null, 'agg')).to.throw(error);
    });
  });

  describe('getAggregates', function() {
    it('should return the instance of QueryAggregate from a name', function() {
      const query = new Query();
      query.addAggregate(new QueryAggregate());
      query.addAggregate(new QueryAggregate());

      chai.expect(query.getAggregates()).to.have.length(2);
    });
  });

  describe('setPage', function() {
    it('should not have a page setting if none was given', function() {
      const query = new Query();
      chai.expect(query.getPage()).to.be.null;
    });

    it('should throw if Page is not an integer (if Page is a string)', function() {
      const query = new Query();
      const page = 'test';
      const error = 'Page number must be an integer.';

      chai.expect(query.setPage.bind(null, page)).to.throw(error);
    });

    it('should throw if Page is not an integer (if Page is undefined)', function() {
      const query = new Query();
      const error = 'Page number must be an integer.';

      chai.expect(query.setPage.bind(null, undefined)).to.throw(error);
    });

    it('should throw if PageSize is not an integer (if PageSize is a float)', function() {
      const query = new Query();
      const page = 13.37;
      const error = 'Page number must be an integer.';

      chai.expect(query.setPage.bind(null, page)).to.throw(error);
    });

    it('should throw if PageSize is negative', function() {
      const query = new Query();
      const page = -13;
      const error = 'Page number cannot be a negative number.';

      chai.expect(query.setPage.bind(null, page)).to.throw(error);
    });

    it('should set page when setPage is called', function() {
      const query = new Query()
        .setPage(17);

      chai.expect(query.getPage()).to.equal(17);
    });
  });

  describe('setPageSize', function() {
    it('should default to a page size of 100', function() {
      const query = new Query();
      chai.expect(query.getPageSize()).to.equal(100);
    });

    it('should set a pageSize if specified', function() {
      const query = new Query()
        .setPageSize(666);
      chai.expect(query.getPageSize()).to.equal(666);
    });

    it('should throw if PageSize is not an integer (if PageSize is a string)', function() {
      const query = new Query();
      const pageSize = 'test';
      const error = 'Page size must be an integer.';

      chai.expect(query.setPageSize.bind(null, pageSize)).to.throw(error);
    });

    it('should throw if PageSize is not an integer (if PageSize is undefined)', function() {
      const query = new Query();
      const error = 'Page size must be an integer.';

      chai.expect(query.setPageSize.bind(null, undefined)).to.throw(error);
    });

    it('should throw if PageSize is not an integer (if PageSize is a float)', function() {
      const query = new Query();
      const pageSize = 13.37;
      const error = 'Page size must be an integer.';

      chai.expect(query.setPageSize.bind(null, pageSize)).to.throw(error);
    });

    it('should throw if PageSize is negative', function() {
      const query = new Query();
      const pageSize = -13;
      const error = 'Page size cannot be a negative number.';

      chai.expect(query.setPageSize.bind(null, pageSize)).to.throw(error);
    });
  });

  describe('toBQLAggsQuery', function() {
    it('should return JSON object', function() {
      const query = new Query()
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
              {
                distinct: {
                  field: 'http_code',
                  order: { value: 'asc' },
                  size: 300,
                },
              },
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

      chai.expect(query.toBQLAggsQuery()).to.deep.equal(json);
    });
  });

  describe('processResponse', function() {
    it('should return JSON object (with transformations)', function() {
      const queryAggregate = new QueryAggregate()
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
        .addMetric('avg', 'delay_last_byte');

      const query = new Query()
        .addAggregate(queryAggregate)
        .setFilters({
          field: 'strategic.is_strategic',
          predicate: 'eq',
          value: true,
        });

      const response = {
        count: 37,
        aggs: [
          {
            groups: [
              {
                key: [
                  200,
                  {
                    from: 0,
                    to: 500,
                  },
                ],
                metrics: [
                  4,
                  157.25,
                ],
              },
              {
                key: [
                  200,
                  {
                    from: 500,
                    to: 1000,
                  },
                ],
                metrics: [
                  28,
                  751.25,
                ],
              },
              {
                key: [
                  301,
                  {
                    from: 1000,
                  },
                ],
                metrics: [
                  5,
                  1809.8,
                ],
              },
            ],
          },
        ],
      };

      const expectedOutput = {
        count: 37,
        aggs: [
          {
            groups: [
              {
                key: [
                  {
                    value: 200,
                    metadata: {},
                  },
                  {
                    from: 0,
                    to: 500,
                    metadata: { label: 'Fast' },
                  },
                ],
                metrics: [
                  4,
                  157.25,
                ],
              },
              {
                key: [
                  {
                    value: 200,
                    metadata: {},
                  },
                  {
                    from: 500,
                    to: 1000,
                    metadata: { label: 'Quite slow' },
                  },
                ],
                metrics: [
                  28,
                  751.25,
                ],
              },
              {
                key: [
                  {
                    value: 301,
                    metadata: { label: 'Redirections' },
                  },
                  {
                    from: 1000,
                    metadata: {},
                  },
                ],
                metrics: [
                  5,
                  1809.8,
                ],
              },
            ],
          },
        ],
      };

      const options = { transformTermKeys: true, injectMetadata: true };
      chai.expect(query.processResponse(response, options)).to.deep.equal(expectedOutput);
    });

    it('should return JSON object (without transformations)', function() {
      const queryAggregate = new QueryAggregate()
        .addTermGroupBy('http_code', [
          {
            value: 301,
          },
          {
            value: 404,
          },
        ])
        .addRangeGroupBy('delay_last_byte', [
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
        ])
        .addMetric('count')
        .addMetric('avg', 'delay_last_byte');

      const query = new Query()
        .addAggregate(queryAggregate)
        .setFilters({
          field: 'strategic.is_strategic',
          predicate: 'eq',
          value: true,
        });

      const response = {
        count: 37,
        aggs: [
          {
            groups: [
              {
                key: [
                  200,
                  {
                    from: 0,
                    to: 500,
                  },
                ],
                metrics: [
                  4,
                  157.25,
                ],
              },
              {
                key: [
                  200,
                  {
                    from: 500,
                    to: 1000,
                  },
                ],
                metrics: [
                  28,
                  751.25,
                ],
              },
              {
                key: [
                  301,
                  {
                    from: 1000,
                  },
                ],
                metrics: [
                  5,
                  1809.8,
                ],
              },
            ],
          },
        ],
      };

      const expectedOutput = {
        count: 37,
        aggs: [
          {
            groups: [
              {
                key: [
                  200,
                  {
                    from: 0,
                    to: 500,
                  },
                ],
                metrics: [
                  4,
                  157.25,
                ],
              },
              {
                key: [
                  200,
                  {
                    from: 500,
                    to: 1000,
                  },
                ],
                metrics: [
                  28,
                  751.25,
                ],
              },
              {
                key: [
                  301,
                  {
                    from: 1000,
                  },
                ],
                metrics: [
                  5,
                  1809.8,
                ],
              },
            ],
          },
        ],
      };

      chai.expect(query.processResponse(response)).to.deep.equal(expectedOutput);
    });

    it('should not add a aggs property if no aggregate defined', function() {
      const query = new Query();
      const response = {
        count: 37,
      };
      const expectedOutput = {
        count: 37,
      };

      chai.expect(query.processResponse(response)).to.deep.equal(expectedOutput);
    });

    it('should throw an error if no response', function() {
      const query = new Query()
        .addAggregate(
          new QueryAggregate().addMetric('avg', 'delay')
        );
      const response = null;

      chai.expect(query.processResponse.bind(query, response)).to.throw(ApiResponseError, 'missing response');
    });

    it('should throw an error if no aggs in response whereas aggregates have been defined', function() {
      const query = new Query()
        .addAggregate(
          new QueryAggregate().addMetric('avg', 'delay')
        );
      const queryNoAggs = new Query();
      const response = {
        count: 37,
      };

      chai.expect(query.processResponse.bind(query, response)).to.throw(ApiResponseError, 'missing aggs whereas aggregate(s) have been defined');
      chai.expect(queryNoAggs.processResponse.bind(queryNoAggs, response)).to.not.throw(ApiResponseError);
    });

    it('should throw an error if aggs length doesnt match with number of defined aggregates', function() {
      const query = new Query()
        .addAggregate(
          new QueryAggregate().addMetric('avg', 'delay')
        );
      const response = {
        count: 37,
        aggs: [],
      };

      chai.expect(query.processResponse.bind(query, response)).to.throw(ApiResponseError, 'missing agg items');
    });

    it('should normalize aggs if result count equals 0 and aggs length doesnt match with number of defined aggregates', function() {
      const query = new Query()
        .addAggregate(
          new QueryAggregate().addMetric('avg', 'delay')
        );
      const response = {
        count: 0,
        aggs: [],
      };

      const expectedOutput = {
        count: 0,
        aggs: [
          {
            groups: [],
          },
        ],
      };

      chai.expect(query.processResponse(response)).to.deep.equal(expectedOutput);
    });
  });
});
