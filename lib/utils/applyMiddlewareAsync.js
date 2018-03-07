'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = applyMiddlewareAsync;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

function compose() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (initial) {
    return middlewares.reduceRight(function (prev, next) {
      return next(prev);
    }, initial);
  };
}

/**
 * @metaParam {...Middlewares} middlewares
 * @metaParam {Object?} middlewareAPI
 * @param     {Func} func
 * @return    {Func}
 * Example: applyMiddlewareAsync(add3ToInput)(func)
 */

function applyMiddlewareAsync() {
  for (var _len2 = arguments.length, middlewares = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    middlewares[_key2] = arguments[_key2];
  }

  return function (func) {
    var length = middlewares.length;
    var middlewareAPI = length > 0 ? middlewares[length - 1] : undefined;

    middlewareAPI = (0, _lodashIsplainobject2['default'])(middlewareAPI) ? (length--, middlewareAPI) : undefined;
    middlewares = middlewares.slice(0, length); // eslint-disable-line no-param-reassign

    var chain = middlewares.map(function (middleware) {
      return middleware(middlewareAPI);
    });
    return compose.apply(undefined, _toConsumableArray(chain))(func);
  };
}

module.exports = exports['default'];