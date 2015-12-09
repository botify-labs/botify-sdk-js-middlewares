'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashGet = require('lodash.get');

var _lodashGet2 = _interopRequireDefault(_lodashGet);

var _lodashIsarray = require('lodash.isarray');

var _lodashIsarray2 = _interopRequireDefault(_lodashIsarray);

var _modelsQuery = require('../models/Query');

var _modelsQuery2 = _interopRequireDefault(_modelsQuery);

var CONTROLLER_ID = 'AnalysisController';
var OPERATION_ID = 'getUrlsAggs';
var QUERIES_KEY_PATH = ['urlsAggsQueries'];

/**
 * @param  {Boolean?} options.transformTermKeys Turn term keys into objects: key -> { value: key }
 * @param  {Boolean?} options.injectMetadata    Inject metadata in groups keys
 * @param  {Boolean?} options.normalizeBoolean  Transform keys 'T' and 'F' to true and false
 * @return {Middleware}
 */

exports['default'] = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$transformTermKeys = _ref.transformTermKeys;
  var transformTermKeys = _ref$transformTermKeys === undefined ? true : _ref$transformTermKeys;
  var _ref$injectMetadata = _ref.injectMetadata;
  var injectMetadata = _ref$injectMetadata === undefined ? true : _ref$injectMetadata;
  var _ref$normalizeBoolean = _ref.normalizeBoolean;
  var normalizeBoolean = _ref$normalizeBoolean === undefined ? true : _ref$normalizeBoolean;

  return function queryMiddleware(_ref2) {
    var controllerId = _ref2.controllerId;
    var operationId = _ref2.operationId;

    return function (next) {
      return function (params, callback, options) {
        if (controllerId !== CONTROLLER_ID || operationId !== OPERATION_ID) {
          return next.apply(undefined, arguments);
        }

        var queries = (0, _lodashGet2['default'])(params, QUERIES_KEY_PATH);
        var queriesError = !queries || !(0, _lodashIsarray2['default'])(queries) || !queries.every(function (query) {
          return query instanceof _modelsQuery2['default'];
        });

        if (queriesError) {
          throw new Error('queries param must be an array of Query');
        }

        next(_extends({}, params, {
          urlsAggsQueries: queries.map(function (query) {
            return query.toJsonAPI();
          })
        }), function (error, results) {
          if (error) {
            return callback.apply(undefined, arguments);
          }
          var processResponseError = null;
          var processedResponse = undefined;
          try {
            processedResponse = results.map(function (result, i) {
              return queries[i].processResponse(result, {
                transformTermKeys: transformTermKeys,
                injectMetadata: injectMetadata,
                normalizeBoolean: normalizeBoolean
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

module.exports = exports['default'];