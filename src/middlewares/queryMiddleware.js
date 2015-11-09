import isArray from 'lodash.isarray';

import Query from '../models/Query';


const CONTROLLER_ID = 'AnalysisController';
const OPERATION_ID = 'getUrlsAggs';
const QUERIES_PARAM_KEY = 'queries';

/**
 * @param  {Boolean?} options.transformTermKeys Turn term keys into objects: key -> { value: key }
 * @param  {Boolean?} options.injectMetadata    Inject metadata in groups keys
 * @param  {Boolean?} options.normalizeBoolean  Transform keys 'T' and 'F' to true and false
 * @return {Middleware}
 */
export default function({
  transformTermKeys = true,
  injectMetadata = true,
  normalizeBoolean = true,
} = {}) {
  return function queryMiddleware({controllerId, operationId}) {
    return next => function(params, callback, options) {
      if (controllerId !== CONTROLLER_ID || operationId !== OPERATION_ID) {
        return next(...arguments);
      }

      const queriesError = !params
                      || !isArray(params[QUERIES_PARAM_KEY])
                      || !params[QUERIES_PARAM_KEY].every(query => query instanceof Query);

      if (queriesError) {
        throw new Error('queries param must be an array of Query');
      }

      const queries = params.queries;
      next(
        {
          ...params,
          queries: queries.map(query => query.toJsonAPI()),
        },
        function(error, results) {
          if (error) {
            return callback(...arguments);
          }
          try {
            callback(error, results.map((result, i) => {
              return queries[i].processResponse(result, {
                transformTermKeys,
                injectMetadata,
                normalizeBoolean,
              });
            }));
          } catch (e) {
            callback(e);
          }
        },
        options
      );
    };
  };
}
