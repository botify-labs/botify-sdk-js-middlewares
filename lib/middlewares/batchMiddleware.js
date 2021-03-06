'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashGet = require('lodash.get');

var _lodashGet2 = _interopRequireDefault(_lodashGet);

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _lodashFindindex = require('lodash.findindex');

var _lodashFindindex2 = _interopRequireDefault(_lodashFindindex);

var _lodashFlatten = require('lodash.flatten');

var _lodashFlatten2 = _interopRequireDefault(_lodashFlatten);

var _lodashIsarray = require('lodash.isarray');

var _lodashIsarray2 = _interopRequireDefault(_lodashIsarray);

var _lodashPick = require('lodash.pick');

var _lodashPick2 = _interopRequireDefault(_lodashPick);

var _lodashPluck = require('lodash.pluck');

var _lodashPluck2 = _interopRequireDefault(_lodashPluck);

var _lodashSet = require('lodash.set');

var _lodashSet2 = _interopRequireDefault(_lodashSet);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _lodashSumby = require('lodash.sumby');

var _lodashSumby2 = _interopRequireDefault(_lodashSumby);

var _lodashSize = require('lodash.size');

var _lodashSize2 = _interopRequireDefault(_lodashSize);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var DEFAULT_BATCHED_OPERATIONS = [{
  controllerId: 'AnalysisController',
  operationId: 'getUrlsAggs',
  commonKeys: ['username', 'projectSlug', 'analysisSlug', 'area'],
  batchedKeyPath: ['aggsQueries'],
  queueLimit: 15
}];

exports.DEFAULT_BATCHED_OPERATIONS = DEFAULT_BATCHED_OPERATIONS;

var Queue = (function () {
  /**
   * @param  {Func}   operation
   * @param  {Object} params
   * @param  {String || Array<String>} paramKeyBached
   */

  function Queue(operation, params, paramKeyBached) {
    var queueLimit = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var timeout = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
    var options = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];

    _classCallCheck(this, Queue);

    this.operation = operation;
    this.params = params;
    this.bachedKey = paramKeyBached;
    this.queueLimit = queueLimit;
    this.timeout = timeout;
    this.options = options;

    this.resources = [];
    this.onRequestListeners = [];
    this.sent = false;
  }

  /**
   * Return the size of the queue
   */

  _createClass(Queue, [{
    key: 'size',
    value: function size() {
      return (0, _lodashSumby2['default'])(this.resources, function (resource) {
        return (0, _lodashSize2['default'])(resource.items);
      });
    }

    /**
     * @param {Array<Item>} items
     * @param {Function}    callback
     */
  }, {
    key: 'addResource',
    value: function addResource(items, callback) {
      if (!(0, _lodashIsarray2['default'])(items)) {
        throw new Error('items must be an array');
      }
      this.resources.push({
        items: items,
        callback: callback
      });
      this._requestIfNeed();
    }
  }, {
    key: 'addOnRequestListener',
    value: function addOnRequestListener(handler) {
      this.onRequestListeners.push(handler);
    }
  }, {
    key: '_requestIfNeed',
    value: function _requestIfNeed() {
      var _this = this;

      // If I have a queue limit and the current number of queries
      // is above this limit request right now, if not report the request
      // so other requests can be sent in this batch too
      if (this.queueLimit && this.size() >= this.queueLimit) {
        this._request();
      } else {
        setTimeout(function () {
          _this._request();
        }, this.timeout);
      }
    }
  }, {
    key: '_request',
    value: function _request() {
      var _this2 = this;

      if (this.sent) {
        return;
      }

      this.sent = true;
      this._onRequest();

      var batchedItems = (0, _lodashFlatten2['default'])((0, _lodashPluck2['default'])(this.resources, 'items'));
      var params = (0, _lodashSet2['default'])(this.params, this.bachedKey, batchedItems);

      this.operation(params, function (error, result) {
        var resultIndex = 0;
        _this2.resources.forEach(function (_ref) {
          var items = _ref.items;
          var callback = _ref.callback;

          if (error) {
            return callback(error);
          }
          if (!result) {
            return callback({
              errorMessage: 'API returned an empty body',
              errorCode: 200,
              errorResponse: result
            });
          }
          var itemsResults = items.map(function (item) {
            return result[resultIndex++];
          });
          var resourceErrorIndex = (0, _lodashFindindex2['default'])(itemsResults, function (itemResult) {
            return !!itemResult.error;
          });
          if (resourceErrorIndex >= 0) {
            var resourceError = itemsResults[resourceErrorIndex];
            return callback({
              errorMessage: 'Resource ' + resourceErrorIndex + ' failed',
              errorCode: resourceError.status,
              errorResponse: _extends({}, resourceError, {
                error: _extends({}, resourceError.error, {
                  resource_index: resourceErrorIndex
                })
              })
            });
          }
          return callback(null, itemsResults.map(function (itemResult) {
            return (0, _lodashIsarray2['default'])(itemResult) ? itemResult.map(_this2._formatResponse) : _this2._formatResponse(itemResult);
          }));
        });
      }, this.options);
    }
  }, {
    key: '_formatResponse',
    value: function _formatResponse(result) {
      return _extends({}, (0, _lodashOmit2['default'])(result, ['error', 'data']), result.data);
    }
  }, {
    key: '_onRequest',
    value: function _onRequest() {
      this.onRequestListeners.forEach(function (handler) {
        return handler();
      });
    }
  }]);

  return Queue;
})();

var queues = {};

/**
 * @param  {?Array<{controllerId, operationId, commonKeys, batchedKeyPath, queueLimit}>} batchedOperations
 * @param  {Integer} timeout
 * @return {Middleware}
 * @warning This middleware do not propagate operation options
 */

exports['default'] = function () {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref2$batchedOperations = _ref2.batchedOperations;
  var batchedOperations = _ref2$batchedOperations === undefined ? DEFAULT_BATCHED_OPERATIONS : _ref2$batchedOperations;
  var _ref2$timeout = _ref2.timeout;
  var timeout = _ref2$timeout === undefined ? 0 : _ref2$timeout;

  return function batchMiddleware(_ref3) {
    var controllerId = _ref3.controllerId;
    var operationId = _ref3.operationId;

    return function (next) {
      return function (params, callback) {
        var _ref4 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var _ref4$batch = _ref4.batch;
        var batch = _ref4$batch === undefined ? true : _ref4$batch;

        var options = (0, _lodashOmit2['default'])(arguments[2], ['batch']);
        var batchOperation = batch && (0, _lodashFind2['default'])(batchedOperations, function (bo) {
          return bo.controllerId === controllerId && bo.operationId === operationId;
        });

        if (!batchOperation) {
          return next(params, callback, options);
        }

        var hash = (0, _objectHash2['default'])({
          commonParams: (0, _lodashPick2['default'])(params, batchOperation.commonKeys),
          options: options,
          controllerId: controllerId,
          operationId: operationId
        });

        var createQueue = !queues[hash];
        if (createQueue) {
          queues[hash] = new Queue(next, params, batchOperation.batchedKeyPath, batchOperation.queueLimit, timeout, options);
          queues[hash].addOnRequestListener(function () {
            return queues[hash] = null;
          });
        }

        var batchedItems = (0, _lodashGet2['default'])(params, batchOperation.batchedKeyPath);
        queues[hash].addResource(batchedItems, callback);

        return false;
      };
    };
  };
};