import chai from 'chai';
import sinon from 'sinon';

import QueryAggregate, { ApiResponseError } from '../../src/models/QueryAggregate';


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
      chai.expect(queryAggregate.getGroupBys()).to.include({
        terms,
        field: 'http_code',
        order: { value: 'asc' },
        size: 300,
      });
    });
  });

  describe('addGroupBy', function() {
    it('should add a new Group by', function() {
      const queryAggregate = new QueryAggregate();
      const field = 'http_code';
      queryAggregate.addGroupBy(field);
      chai.expect(queryAggregate.getGroupBys()).to.have.length(1);
      chai.expect(queryAggregate.getGroupBys()).to.include({
        terms: [],
        field: 'http_code',
        order: { value: 'asc' },
        size: 300,
      });
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
      chai.expect(queryAggregate.getGroupBys()).to.include({
        terms,
        field: 'http_code',
        order: { value: 'asc' },
        size: 300,
      });
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
      };

      chai.expect(queryAggregate.toJsonAPI()).to.deep.equal(json);
    });
  });

  describe('processResponse', function() {
    it('should apply groupby reducers on keys', function() {
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

      const response = {
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
      };

      sinon.spy(queryAggregate.groupBys[0], 'applyKeyReducers');
      sinon.spy(queryAggregate.groupBys[1], 'applyKeyReducers');

      queryAggregate.processResponse(response);

      chai.expect(queryAggregate.groupBys[0].applyKeyReducers.callCount).to.be.equal(3);
      chai.expect(queryAggregate.groupBys[0].applyKeyReducers.getCall(0).args[0]).to.be.deep.equal(200);
      chai.expect(queryAggregate.groupBys[0].applyKeyReducers.getCall(1).args[0]).to.be.deep.equal(200);
      chai.expect(queryAggregate.groupBys[0].applyKeyReducers.getCall(2).args[0]).to.be.deep.equal(301);

      chai.expect(queryAggregate.groupBys[1].applyKeyReducers.callCount).to.be.equal(3);
      chai.expect(queryAggregate.groupBys[1].applyKeyReducers.getCall(0).args[0]).to.be.deep.equal({from: 0, to: 500});
      chai.expect(queryAggregate.groupBys[1].applyKeyReducers.getCall(1).args[0]).to.be.deep.equal({from: 500, to: 1000});
      chai.expect(queryAggregate.groupBys[1].applyKeyReducers.getCall(2).args[0]).to.be.deep.equal({from: 1000});
    });

    it('should not add a groups property if no groupby defined', function() {
      const queryAggregate = new QueryAggregate()
        .addMetric('avg', 'delay_last_byte');

      const response = {
        metrics: [
          118.52380952380952,
        ],
      };

      const expectedOutput = {
        metrics: [
          118.52380952380952,
        ],
      };

      chai.expect(queryAggregate.processResponse(response)).to.deep.equal(expectedOutput);
    });

    it('should throw an error if no agg', function() {
      const queryAggregate = new QueryAggregate();
      const response = null;

      chai.expect(queryAggregate.processResponse.bind(queryAggregate, response)).to.throw(ApiResponseError, 'missing agg');
    });

    it('should throw an error if no groups in response whereas groupby have been defined', function() {
      const queryAggregate = new QueryAggregate().addTermGroupBy('http_code');
      const queryAggregateNoGroupbys = new QueryAggregate();
      const response = {
        count: 37,
      };

      chai.expect(queryAggregate.processResponse.bind(queryAggregate, response)).to.throw(ApiResponseError, 'missing groups whereas groupby(s) have been defined');
      chai.expect(queryAggregateNoGroupbys.processResponse.bind(queryAggregateNoGroupbys, response)).to.not.throw(ApiResponseError);
    });
  });

  describe('_processGroupResponse', function() {
    it('should throw an error if no group', function() {
      const queryAggregate = new QueryAggregate();
      const response = null;

      chai.expect(queryAggregate._processGroupResponse.bind(queryAggregate, response, {})).to.throw(ApiResponseError, 'missing group');
    });

    it('should throw an error if no group key', function() {
      const queryAggregate = new QueryAggregate();
      const response = {
        metrics: [0],
      };

      chai.expect(queryAggregate._processGroupResponse.bind(queryAggregate, response, {})).to.throw(ApiResponseError, 'missing group key');
    });

    it('should throw an error if group key length doesnt match with number of defined grupbys', function() {
      const queryAggregate = new QueryAggregate().addTermGroupBy('http_code');
      const queryAggregateNoGroupbys = new QueryAggregate();
      const response = {
        key: [],
        metrics: [0],
      };

      chai.expect(queryAggregate._processGroupResponse.bind(queryAggregate, response, {})).to.throw(ApiResponseError, 'missing group key items');
      chai.expect(queryAggregateNoGroupbys._processGroupResponse.bind(queryAggregateNoGroupbys, response, {})).to.not.throw(ApiResponseError);
    });
  });
});
