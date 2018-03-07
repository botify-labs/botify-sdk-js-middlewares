'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.computeItemCacheKey = computeItemCacheKey;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lsCache = require('ls-cache');

var _lsCache2 = _interopRequireDefault(_lsCache);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _utilsFlushLocalStorage = require('../utils/flushLocalStorage');

var _utilsFlushLocalStorage2 = _interopRequireDefault(_utilsFlushLocalStorage);

var DATA_MODEL_VERSION = '0.0.1';
var LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; // In Minutes
var LSCACHE_BUCKET_ID = 'botifySdk-';
var lscacheBucket = _lsCache2['default'].createBucket(LSCACHE_BUCKET_ID);

exports.lscacheBucket = lscacheBucket;

function computeItemCacheKey(params) {
  return (0, _objectHash2['default'])(params);
}

/**
 * @param  {?Array<{controllerId, operationId}>} cachedOperations
 * @return {Middleware}
 */

exports['default'] = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$cachedOperations = _ref.cachedOperations;
  var cachedOperations = _ref$cachedOperations === undefined ? [] : _ref$cachedOperations;

  (0, _utilsFlushLocalStorage2['default'])(DATA_MODEL_VERSION);

  return function lscacheMiddleware() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var controllerId = _ref2.controllerId;
    var operationId = _ref2.operationId;

    /**
     * @param  {Object}   params
     * @param  {Function} callback
     * @param  {Boolean?}  options.cache
     * @param  {Boolean?}  options.invalidate
     * @param  {String?}  options.bucketId
     */
    return function (next) {
      return function (params, callback) {
        var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var cache = _ref3.cache;
        var _ref3$invalidate = _ref3.invalidate;
        var invalidate = _ref3$invalidate === undefined ? false : _ref3$invalidate;
        var bucketId = _ref3.bucketId;

        var options = (0, _lodashOmit2['default'])(arguments[2], ['cache', 'invalidate', 'bucketId']);
        var cachedOperation = (0, _lodashFind2['default'])(cachedOperations, function (co) {
          return co.controllerId === controllerId && co.operationId === operationId;
        });

        if (!(typeof cache === 'undefined' ? cachedOperation : cache)) {
          return next(params, callback, options);
        }

        var bucket = bucketId ? _lsCache2['default'].createBucket(bucketId) : lscacheBucket;
        var itemKey = computeItemCacheKey(params);
        if (!invalidate) {
          var itemValue = bucket.get(itemKey);
          if (itemValue) {
            callback(null, itemValue);
            return false;
          }
        }

        next(params, function (error, result) {
          if (!error) {
            try {
              bucket.set(itemKey, result, LSCACHE_EXPIRATION_MIN);
            } catch (e) {
              // If an error occurred while setting cache, flush the bucket
              bucket.keys().forEach(function (key) {
                bucket.remove(key);
              });
            }
          }
          callback.apply(undefined, arguments);
        }, options);
      };
    };
  };
};