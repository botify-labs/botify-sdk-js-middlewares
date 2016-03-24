import get from 'lodash.get';
import isArray from 'lodash.isarray';

import Query from '../models/Query';


const CONTROLLER_ID = 'AnalysisController';
const OPERATION_ID = 'getUrlsAggs';
const QUERIES_KEY_PATH = ['urlsAggsQueries'];

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
      if (controllerId !== CONTROLLER_ID || operationId !== OPERATION_ID) {
        return next(...arguments);
      }

      const queries = get(params, QUERIES_KEY_PATH);
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
