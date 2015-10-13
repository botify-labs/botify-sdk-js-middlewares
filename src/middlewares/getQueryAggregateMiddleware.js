const Query = class Query {}; //TODO: Replace by real class


const GET_QUERY_AGGREGATES_OPERATION_ID = 'getQueryAggregate';
const QUERIES_PARAM_KEY = 'queries';

/**
 * @param  {Boolean?} options.transformTermKeys Turn term keys into objects: key -> { value: key }
 * @param  {Boolean?} options.injectMetadata    Inject metadata in groups keys
 * @param  {Boolean?} options.normalizeBoolean  Transform keys 'T' and 'F' to true and false
 * @return {Middleware}                            [description]
 */
export default function({
  transformTermKeys = true,
  injectMetadata = true,
  normalizeBoolean = true,
}) {
  return function getQueriesAggregateMiddleware({operationId}) {
    return next => function(params, callback, options) {
      if (operationId !== GET_QUERY_AGGREGATES_OPERATION_ID) {
        next(...arguments);
      }
      const queries = params[QUERIES_PARAM_KEY].map(query => {
        if (query instanceof Query) {
          return query;
        }
        return new Query().fromObject(query);
      })

      next(
        {
          ...params,
          queries: queries.map(query => query.toJsonAPI)
        },
        function(error, results) {
          if (error) {
            return callback(...arguments);
          }
          callback(error, results.map((result, i) => {
            return queries[i].processResponse(result, {
              transformTermKeys,
              injectMetadata,
              normalizeBoolean,
            });
          }));
        },
        options
      );
    };
  }
}
