import lscache from 'ls-cache';
import objectHash from 'object-hash';
import find from 'lodash.find';
import omit from 'lodash.omit';

import flushLocalStorageIfDataModelVersionChanged from '../utils/flushLocalStorage';


const DATA_MODEL_VERSION = '0.0.1';
const LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; // In Minutes
const LSCACHE_BUCKET_ID = 'botifySdk-';
export const lscacheBucket = lscache.createBucket(LSCACHE_BUCKET_ID);

export function computeItemCacheKey(params) {
  return objectHash(params);
}

/**
 * @param  {?Array<{controllerId, operationId}>} cachedOperations
 * @return {Middleware}
 */
export default function({
  cachedOperations = [],
} = {}) {
  flushLocalStorageIfDataModelVersionChanged(DATA_MODEL_VERSION);

  return function lscacheMiddleware({controllerId, operationId} = {}) {
    /**
     * @param  {Object}   params
     * @param  {Function} callback
     * @param  {Boolean?}  options.cache
     * @param  {Boolean?}  options.invalidate
     * @param  {String?}  options.bucketId
     */
    return next => function(params, callback, {cache, invalidate = false, bucketId} = {}) {
      const options = omit(arguments[2], ['cache', 'invalidate', 'bucketId']);
      const cachedOperation = find(cachedOperations, co => co.controllerId === controllerId && co.operationId === operationId);

      if (!(typeof cache === 'undefined' ? cachedOperation : cache)) {
        return next(params, callback, options);
      }

      const bucket = bucketId ? lscache.createBucket(bucketId) : lscacheBucket;
      const itemKey = computeItemCacheKey(params);
      if (!invalidate) {
        const itemValue = bucket.get(itemKey);
        if (itemValue) {
          callback(null, itemValue);
          return false;
        }
      }

      next(
        params,
        function(error, result) {
          if (!error) {
            try {
              bucket.set(itemKey, result, LSCACHE_EXPIRATION_MIN);
            } catch(e) {
              // If an error occurred while setting cache, flush the bucket
              bucket.flushRecursive();
            }
          }
          callback(...arguments);
        },
        options
      );
    };
  };
}
