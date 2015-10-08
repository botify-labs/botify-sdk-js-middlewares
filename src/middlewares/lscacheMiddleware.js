import lscache from 'ls-cache';
import hash from 'object-hash';

import flushLocalStorageIfDataModelVersionChanged from '../utils/flushLocalStorage';


const DATA_MODEL_VERSION = '0.0.1';
const LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; // In Minutes
const LSCACHE_BUCKET_ID = 'botifySdk-';
export const lscacheBucket = lscache.createBucket(LSCACHE_BUCKET_ID);

export function computeItemCacheKey(params) {
  return `${hash(params)}`;
}

export default function lscacheMiddleware() {
  /**
   * @param  {Object}   params
   * @param  {Function} callback
   * @param  {Boolean?}  options.cache
   * @param  {String?}  options.bucketId
   */
  return next => function(params, callback, {cache = false, invalidate = false, bucketId} = {}) {
    if (!cache) {
      return next(...arguments);
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
          bucket.set(itemKey, result, LSCACHE_EXPIRATION_MIN);
        }
        callback(...arguments);
      }
    );
  };
}

flushLocalStorageIfDataModelVersionChanged(DATA_MODEL_VERSION);
