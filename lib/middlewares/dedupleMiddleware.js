'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = dedupleMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

function dedupleMiddleware(_ref) {
  var controllerId = _ref.controllerId;
  var operationId = _ref.operationId;

  var currentOperations = {};

  return function (next) {
    return function (params, callback, options) {
      var hash = (0, _objectHash2['default'])({
        controllerId: controllerId,
        operationId: operationId,
        params: params,
        options: options
      });

      if (currentOperations[hash]) {
        currentOperations[hash].push(callback);
      } else {
        currentOperations[hash] = [callback];
        next(params, function (error, result) {
          currentOperations[hash].forEach(function (cb) {
            return cb(error, result);
          });
          currentOperations[hash] = null;
        }, options);
      }
    };
  };
}

module.exports = exports['default'];