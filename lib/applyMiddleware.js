'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.applyMiddlewareController = applyMiddlewareController;
exports['default'] = applyMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _lodashEndswith = require('lodash.endswith');

var _lodashEndswith2 = _interopRequireDefault(_lodashEndswith);

var _lodashMapvalues = require('lodash.mapvalues');

var _lodashMapvalues2 = _interopRequireDefault(_lodashMapvalues);

var _utilsApplyMiddlewareAsync = require('./utils/applyMiddlewareAsync');

var _utilsApplyMiddlewareAsync2 = _interopRequireDefault(_utilsApplyMiddlewareAsync);

function applyMiddlewareController() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (controller, controllerId, baseSdk) {
    return (0, _lodashMapvalues2['default'])(controller, function (operation, operationId) {
      var middlewareAPI = {
        controllerId: controllerId,
        operationId: operationId,
        baseSdk: baseSdk
      };
      return _utilsApplyMiddlewareAsync2['default'].apply(undefined, _toConsumableArray(middlewares.concat(middlewareAPI)))(operation);
    });
  };
}

/**
 * Apply middleware(s) on sdk's controllers
 * @metaParam {...Middleware} middlewares
 * @param     {SDK} sdk Object<Controllers|any>
 * @return    {SDK}
 */

function applyMiddleware() {
  for (var _len2 = arguments.length, middlewares = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    middlewares[_key2] = arguments[_key2];
  }

  return function (sdk) {
    return (0, _lodashMapvalues2['default'])(sdk, function (value, key) {
      var isController = (0, _lodashEndswith2['default'])(key, 'Controller');
      return isController ? applyMiddlewareController.apply(undefined, middlewares)(value, key, sdk) : value;
    });
  };
}