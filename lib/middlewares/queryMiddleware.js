'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _lodashGet = require('lodash.get');

var _lodashGet2 = _interopRequireDefault(_lodashGet);

var _lodashIsarray = require('lodash.isarray');

var _lodashIsarray2 = _interopRequireDefault(_lodashIsarray);

var _modelsQuery = require('../models/Query');

var _modelsQuery2 = _interopRequireDefault(_modelsQuery);

var _errorsApiResponseError = require('../errors/ApiResponseError');

var _errorsApiResponseError2 = _interopRequireDefault(_errorsApiResponseError);

var DEFAULT_QUERY_OPERATIONS = [{
  controllerId: 'AnalysisController',
  operationId: 'getUrlsAggs',
  queriesProperty: 'aggsQueries'
}, {
  controllerId: 'ProjectController',
  operationId: 'getProjectUrlsAggs',
  queriesProperty: 'aggsQueries'
}];

exports.DEFAULT_QUERY_OPERATIONS = DEFAULT_QUERY_OPERATIONS;
/**
 * @param  {Boolean?} options.processResponse   Enable response post processing. If true, every aggsQueries must be instance of Query.
 * @param  {Boolean?} options.transformTermKeys Turn term keys into objects: key -> { value: key }
 * @param  {Boolean?} options.injectMetadata    Inject metadata in groups keys
 * @return {Middleware}
 */

exports['default'] = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$processResponse = _ref.processResponse;
  var processResponse = _ref$processResponse === undefined ? false : _ref$processResponse;
  var _ref$transformTermKeys = _ref.transformTermKeys;
  var transformTermKeys = _ref$transformTermKeys === undefined ? false : _ref$transformTermKeys;
  var _ref$injectMetadata = _ref.injectMetadata;
  var injectMetadata = _ref$injectMetadata === undefined ? false : _ref$injectMetadata;
  var _ref$queryOperations = _ref.queryOperations;
  var queryOperations = _ref$queryOperations === undefined ? DEFAULT_QUERY_OPERATIONS : _ref$queryOperations;

  return function queryMiddleware(_ref2) {
    var controllerId = _ref2.controllerId;
    var operationId = _ref2.operationId;

    return function (next) {
      return function (params, callback, options) {
        var queryOperation = (0, _lodashFind2['default'])(queryOperations, function (op) {
          return op.controllerId === controllerId && op.operationId === operationId;
        });
        if (!queryOperation) {
          return next.apply(undefined, arguments);
        }

        var queries = (0, _lodashGet2['default'])(params, queryOperation.queriesProperty);
        if (!queries || !(0, _lodashIsarray2['default'])(queries)) {
          throw new Error(queryOperation.queriesProperty + ' param must be an array');
        }

        if (processResponse) {
          if (!queries.every(function (query) {
            return query instanceof _modelsQuery2['default'];
          })) {
            throw new Error(queryOperation.queriesProperty + ' param must be an array of instance of Query');
          }
        }

        var nextRes = _extends({}, params, _defineProperty({}, queryOperation.queriesProperty, queries.map(function (query) {
          return query instanceof _modelsQuery2['default'] ? query.toBQLAggsQuery() : query;
        })));

        next(nextRes, function (error, results) {
          if (error || !processResponse) {
            return callback.apply(undefined, arguments);
          }
          var processResponseError = null;
          var processedResponse = undefined;
          try {
            processedResponse = results.map(function (result, i) {
              // If result is an array, then we requested data for multiple analyses.
              // In this case, failure to get a valid answer for some of the analyses is not a
              // fatal error - so we remove failed requests from the response instead of throwing
              if ((0, _lodashIsarray2['default'])(result)) {
                // Remove failed requests on certain analyses
                var filteredAnalyses = result.filter(function (res) {
                  return res.status === 200;
                });
                // We still throw if the query fails for analyses
                if (filteredAnalyses.length === 0) {
                  throw new _errorsApiResponseError2['default']('query failed on all analyses');
                }

                return filteredAnalyses.map(function (res) {
                  return queries[i].processResponse(res, {
                    transformTermKeys: transformTermKeys,
                    injectMetadata: injectMetadata
                  });
                });
              }
              return queries[i].processResponse(result, {
                transformTermKeys: transformTermKeys,
                injectMetadata: injectMetadata
              });
            });
          } catch (e) {
            processResponseError = e;
          }
          callback(processResponseError, processedResponse);
        }, options);
      };
    };
  };
};