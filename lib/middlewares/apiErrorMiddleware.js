'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = apiErrorMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _errorsApiError = require('../errors/ApiError');

var _errorsApiError2 = _interopRequireDefault(_errorsApiError);

function apiErrorMiddleware() {
  return function (next) {
    return function (params, callback, options) {
      next(params, function (error) {
        if (!error || error instanceof Error) {
          callback.apply(undefined, arguments);
          return;
        }
        var errorMessage = error.errorMessage;
        var errorCode = error.errorCode;
        var errorResponse = error.errorResponse;

        var othersProps = _objectWithoutProperties(error, ['errorMessage', 'errorCode', 'errorResponse']);

        var parsedErrorResponse = undefined;
        try {
          parsedErrorResponse = JSON.parse(errorResponse);
        } catch (err) {
          parsedErrorResponse = errorResponse;
        } finally {
          callback(new _errorsApiError2['default'](errorMessage, errorCode, parsedErrorResponse, othersProps));
        }
      }, options);
    };
  };
}

exports.ApiError = _errorsApiError2['default'];