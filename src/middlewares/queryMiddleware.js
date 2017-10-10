import find from 'lodash.find';
import get from 'lodash.get';
import isArray from 'lodash.isarray';

import Query from '../models/Query';
import ApiResponseError from '../errors/ApiResponseError';

export const DEFAULT_QUERY_OPERATIONS = [
  {
    controllerId: 'AnalysisController',
    operationId: 'getUrlsAggs',
    queriesProperty: 'urlsAggsQueries',
  },
  {
    controllerId: 'ProjectController',
    operationId: 'getProjectUrlsAggs',
    queriesProperty: 'urlsAggsQueries',
  },
];


/**
 * @param  {Boolean?} options.processResponse   Enable response post processing. If true, every urlsAggsQueries must be instance of Query.
 * @param  {Boolean?} options.transformTermKeys Turn term keys into objects: key -> { value: key }
 * @param  {Boolean?} options.injectMetadata    Inject metadata in groups keys
 * @return {Middleware}
 */
export default function({
  processResponse = false,
  transformTermKeys = false,
  injectMetadata = false,
  queryOperations = DEFAULT_QUERY_OPERATIONS,
} = {}) {
  return function queryMiddleware({controllerId, operationId}) {
    return next => function(params, callback, options) {
      const queryOperation = find(queryOperations, op => op.controllerId === controllerId && op.operationId === operationId);
      if (!queryOperation) {
        return next(...arguments);
      }

      const queries = get(params, queryOperation.queriesProperty);
      if (!queries || !isArray(queries)) {
        throw new Error(queryOperation.queriesProperty + ' param must be an array');
      }

      if (processResponse) {
        if (!queries.every(query => query instanceof Query)) {
          throw new Error(queryOperation.queriesProperty + ' param must be an array of instance of Query');
        }
      }

      const nextRes = {
        ...params,
        [queryOperation.queriesProperty]: queries.map(query => query instanceof Query ? query.toBQLAggsQuery() : query),
      };

      next(nextRes, function(error, results) {
        if (error || !processResponse) {
          return callback(...arguments);
        }
        let processResponseError = null;
        let processedResponse;
        try {
          processedResponse = results.map((result, i) => {
            // If result is an array, then we requested data for multiple analyses.
            // In this case, failure to get a valid answer for some of the analyses is not a
            // fatal error - so we remove failed requests from the response instead of throwing
            if (isArray(result)) {
              // Remove failed requests on certain analyses
              const filteredAnalyses = result.filter((res) => res.status === 200);
              // We still throw if the query fails for analyses
              if (filteredAnalyses.length === 0) {
                throw new ApiResponseError('query failed on all analyses');
              }

              return filteredAnalyses.map(res => queries[i].processResponse(res, {
                transformTermKeys,
                injectMetadata,
              }));
            }
            return queries[i].processResponse(result, {
              transformTermKeys,
              injectMetadata,
            });
          });
        } catch (e) {
          processResponseError = e;
        }
        callback(processResponseError, processedResponse);
      },
        options
      );
    };
  };
}
