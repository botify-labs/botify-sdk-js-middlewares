'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = getUrlDetailEncodeMiddleware;
var CONTROLLER_ID = 'AnalysisController';
var OPERATION_ID = 'getUrlDetail';

function getUrlDetailEncodeMiddleware(_ref) {
  var controllerId = _ref.controllerId;
  var operationId = _ref.operationId;

  return function (next) {
    return function (params, callback, options) {
      if (controllerId !== CONTROLLER_ID || operationId !== OPERATION_ID) {
        return next.apply(undefined, arguments);
      }
      next(_extends({}, params, {
        url: encodeURIComponent(params.url)
      }), callback, options);
    };
  };
}

module.exports = exports['default'];