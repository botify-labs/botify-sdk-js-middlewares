'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.applyMiddlewareController = applyMiddlewareController;
exports['default'] = applyMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashEndswith = require('lodash.endswith');

var _lodashEndswith2 = _interopRequireDefault(_lodashEndswith);

var _utilsApplyMiddlewareAsync = require('./utils/applyMiddlewareAsync');

var _utilsApplyMiddlewareAsync2 = _interopRequireDefault(_utilsApplyMiddlewareAsync);

function applyMiddlewareController() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (controller, controllerId, baseSdk) {
    return Object.getOwnPropertyNames(controller).reduce(function (res, key) {
      var middlewareAPI = {
        controllerId: controllerId,
        operationId: key,
        baseSdk: baseSdk
      };
      return _extends({}, res, _defineProperty({}, key, _utilsApplyMiddlewareAsync2['default'].apply(undefined, _toConsumableArray(middlewares.concat(middlewareAPI)))(controller[key])));
    }, {});
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
    return Object.keys(sdk).reduce(function (res, key) {
      var isController = (0, _lodashEndswith2['default'])(key, 'Controller');
      return _extends({}, res, _defineProperty({}, key, isController ? applyMiddlewareController.apply(undefined, middlewares)(sdk[key], key, sdk) : sdk[key]));
    }, {});
  };
}