'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getAnalysisBucketId = getAnalysisBucketId;
exports['default'] = invalidateAnalysisMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lsCache = require('ls-cache');

var _lsCache2 = _interopRequireDefault(_lsCache);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var ANALYSES_CONTROLLER_ID = 'AnalysisController';
var GET_ANALYSIS_OPERATION_ID = 'getAnalysisSummary';
var DATE_LAST_MODIFIED_KEY = 'date_last_modified';

var LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; // In Minutes
var INVALIDATE_ANALYSIS_BUCKET_ID = 'botifySdk-invalAna';
var invalidateAnalysisBucket = _lsCache2['default'].createBucket(INVALIDATE_ANALYSIS_BUCKET_ID);

exports.invalidateAnalysisBucket = invalidateAnalysisBucket;

function getAnalysisBucketId(_ref) {
  var username = _ref.username;
  var projectSlug = _ref.projectSlug;
  var analysisSlug = _ref.analysisSlug;

  return (0, _objectHash2['default'])({ username: username, projectSlug: projectSlug, analysisSlug: analysisSlug });
}

/**
 * Update analysis date modified and flush analysis data if changed.
 * @param  {String} options.username
 * @param  {String} options.projectSlug
 * @param  {String} options.analysisSlug
 * @return {String}
 */
function flushIfAnalysisDateLastModifiedChanged(_ref2, dateLastModified) {
  var username = _ref2.username;
  var projectSlug = _ref2.projectSlug;
  var analysisSlug = _ref2.analysisSlug;

  var analysisBucketId = getAnalysisBucketId({ username: username, projectSlug: projectSlug, analysisSlug: analysisSlug });
  var analysisBucket = _lsCache2['default'].createBucket(analysisBucketId);
  var previousDateLastModified = invalidateAnalysisBucket.get(analysisBucketId);

  if (previousDateLastModified !== dateLastModified) {
    // Flush Bucket
    analysisBucket.flushRecursive();
    try {
      // Store date Last Modified of analysis
      invalidateAnalysisBucket.set(analysisBucketId, dateLastModified, LSCACHE_EXPIRATION_MIN);
    } catch (e) {
      // If we get an error while setting the entry, flush the bucket
      invalidateAnalysisBucket.keys().forEach(function (key) {
        invalidateAnalysisBucket.remove(key);
      });
    }
  }
}

function invalidateAnalysisMiddleware(_ref3) {
  var controllerId = _ref3.controllerId;
  var operationId = _ref3.operationId;

  return function (next) {
    return function (params, callback, options) {
      if (controllerId !== ANALYSES_CONTROLLER_ID) {
        return next.apply(undefined, arguments);
      }

      next(params, function (error, result) {
        if (operationId === GET_ANALYSIS_OPERATION_ID && !error) {
          var date = result[DATE_LAST_MODIFIED_KEY];
          flushIfAnalysisDateLastModifiedChanged(params, date);
        }
        callback.apply(undefined, arguments);
      }, _extends({}, options, {
        bucketId: getAnalysisBucketId(params)
      }));
    };
  };
}