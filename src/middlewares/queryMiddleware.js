import find from 'lodash.find';
import get from 'lodash.get';
import isArray from 'lodash.isarray';

import Query from '../models/Query';


export const QUERY_OPERATIONS = [
  {
    controllerId: 'AnalysisController',
    operationId: 'getUrlsAggs',
  },
  {
    controllerId: 'ProjectController',
    operationId: 'getProjectUrlsAggs',
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
} = {}) {
  return function queryMiddleware({controllerId, operationId}) {
    return next => function(params, callback, options) {
      const queryOperation = find(QUERY_OPERATIONS, op => op.controllerId === controllerId && op.operationId === operationId);
      if (!queryOperation) {
        return next(...arguments);
      }

      const queries = get(params, 'urlsAggsQueries');
      if (!queries || !isArray(queries)) {
        throw new Error('urlsAggsQueries param must be an array');
      }

      if (processResponse) {
        if (!queries.every(query => query instanceof Query)) {
          throw new Error('urlsAggsQueries param must be an array of instance of Query');
        }
      }

      next(
        {
          ...params,
          urlsAggsQueries: queries.map(query => {
            return query instanceof Query ? query.toBQLAggsQuery() : query;
          }),
        },
        function(error, results) {
          if (error || !processResponse) {
            return callback(...arguments);
          }
          let processResponseError = null;
          let processedResponse;
          try {
            processedResponse = results.map((result, i) => {
              if (isArray(result)) {
                return result.map(res => queries[i].processResponse(res, {
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
