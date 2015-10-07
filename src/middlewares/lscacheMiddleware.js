import lscache from 'lscache';
import hash from 'object-hash';


const LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; //In Minutes
const LSCACHE_PREFIX = 'botifySdk-';

export default function lscacheMiddleware() {
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
          lscache.set(cacheKey, result, LSCACHE_EXPIRATION_MIN);
        }
        callback(...arguments);
      }
    );
  };
}

export function computeCacheKey(params) {
  return `${LSCACHE_PREFIX}${hash(params)}`;
}
