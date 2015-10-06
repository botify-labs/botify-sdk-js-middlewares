import lscache from 'lscache';
import hash from 'object-hash';


export default function lscacheMiddleware(operationId) {
  return next => function(params, callback, {cache = false} = {}) {
    if (!cache) {
      return next(...arguments);
    }

    const cacheKey = computeCacheKey(params);
    const cacheValue = lscache.get(cacheKey);
    if (cacheValue) {
      callback(null, cacheValue);
      return false;
    }

    next(
      params,
      function(error, result) {
        if (!error && cache) {
          lscache.set(cacheKey, result);
        }
        callback(...arguments);
      }
    );
  };
}

export const CACHED_OPERATIONS = [];
const LSCACHE_PREFIX = 'botifySdk-';

export function computeCacheKey(params) {
  return `${LSCACHE_PREFIX}${hash(params)}`;
}
