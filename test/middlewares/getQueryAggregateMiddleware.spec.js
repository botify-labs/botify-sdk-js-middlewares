import chai from 'chai';
import sinon from 'sinon';

import getQueryAggregateMiddleware from '../../src/middlewares/getQueryAggregateMiddleware';
import Query from '../../src/models/Query';
import QueryAggregate from '../../src/models/QueryAggregate';


describe('getQueryAggregateMiddleware', () => {
  const options = { thatOption: true };

  const middlewareAPI = { controllerId: 'AnalysisController', operationId: 'getQueryAggregate' };
  const nextHandler = getQueryAggregateMiddleware()(middlewareAPI);

  it('must transform input Query instances to API compliant JSON', () => {
    const getQueryAggregateSpy = sinon.spy();
    const callback = sinon.spy();
    const params = {
      queries: [
        new Query()
          .setFilters({field: 'http_code', value: 301})
          .addAggregate(
            new QueryAggregate().addMetric('avg', 'delay')
          ),
        new Query()
          .addAggregate(
            new QueryAggregate().addTermGroupBy('http_code')
          ),
      ],
    };

    nextHandler(getQueryAggregateSpy)(params, callback, options);

    // Expect operation to be called with transformed queries params
    chai.expect(getQueryAggregateSpy.callCount).to.be.equal(1);
    chai.expect(getQueryAggregateSpy.getCall(0).args[0]).to.be.deep.equal({
      queries: params.queries.map(query => query.toJsonAPI()),
    });
    chai.expect(getQueryAggregateSpy.getCall(0).args[2]).to.be.equal(options);
  });

  it('must transform output according to input Query instances', () => {
    const apiResult = [
      {
        count: 42,
        aggs: [
          {
            metrics: [
              118.52380952380952,
            ],
          },
        ],
      },
      {
        count: 42,
        aggs: [
          {
            groups: [
              {
                metrics: [
                  42,
                ],
                key: [
                  200,
                ],
              },
              {
                metrics: [
                  0,
                ],
                key: [
                  301,
                ],
              },
            ],
          },
        ],
      },
    ];
    const middlewareResult = [
      {
        count: 42,
        aggs: [
          {
            metrics: [
              118.52380952380952,
            ],
          },
        ],
      },
      {
        count: 42,
        aggs: [
          {
            groups: [
              {
                metrics: [
                  42,
                ],
                key: [
                  {
                    value: 200,
                    metadata: {},
                  },
                ],
              },
              {
                metrics: [
                  0,
                ],
                key: [
                  {
                    value: 301,
                    metadata: {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    const getQueryAggregate = (params, callback) => callback(null, apiResult);

    const getQueryAggregateSpy = sinon.spy(getQueryAggregate);
    const params = {
      queries: [
        new Query()
          .setFilters({field: 'http_code', value: 301})
          .addAggregate(
            new QueryAggregate().addMetric('avg', 'delay')
          ),
        new Query()
          .addAggregate(
            new QueryAggregate().addTermGroupBy('http_code')
          ),
      ],
    };
    const callback = sinon.spy();

    nextHandler(getQueryAggregateSpy)(params, callback, options);

    // Expect callback to be called with transformed result
    chai.expect(callback.callCount).to.be.equal(1);
    chai.expect(callback.getCall(0).args[0]).to.be.equal(null);
    chai.expect(callback.getCall(0).args[1]).to.be.deep.equal(middlewareResult);
  });

  it('must throw an error if all queries input are not Query instances', () => {
    const getQueryAggregate = () => {};

    const incorrectInput = [
      null,
      '',
      {},
      { queries: {} },
      { queries: ['a', 'b'] },
      { queries: ['a', new Query()] },
      { queries: [new Query(), 'b'] },
    ];
    const correctInput = [
      { queries: [new Query()] },
      { queries: [new Query(), new Query()] },
    ];

    const expectedError = 'queries param must be an array of Query';

    incorrectInput.forEach(input => {
      chai.expect(nextHandler(getQueryAggregate).bind(null, input)).to.throw(expectedError);
    });
    correctInput.forEach(input => {
      chai.expect(nextHandler(getQueryAggregate).bind(null, input)).to.not.throw(expectedError);
    });
  });

  it('must NOT do anything on not batched operation', done => {
    const otherHandler = getQueryAggregateMiddleware()({
      controllerId: 'ProjectsController',
      operationId: 'getProject',
    });

    const apiResult = 'foo';
    const getProject = (x, callback) => callback(null, apiResult);
    const getProjectSpy = sinon.spy(getProject);

    otherHandler(getProjectSpy)(1, (error, result) => {
      chai.expect(getProjectSpy.callCount).to.be.equal(1);

      // Exect callback arguments
      chai.expect(error).to.be.equal(null);
      chai.expect(result).to.be.equal(apiResult);
      done();
    });
  });
});
