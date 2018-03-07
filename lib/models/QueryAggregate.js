'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsempty = require('lodash.isempty');

var _lodashIsempty2 = _interopRequireDefault(_lodashIsempty);

var _lodashIsundefined = require('lodash.isundefined');

var _lodashIsundefined2 = _interopRequireDefault(_lodashIsundefined);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _QueryRangeGroupBy = require('./QueryRangeGroupBy');

var _QueryRangeGroupBy2 = _interopRequireDefault(_QueryRangeGroupBy);

var _QueryTermGroupBy = require('./QueryTermGroupBy');

var _QueryTermGroupBy2 = _interopRequireDefault(_QueryTermGroupBy);

var _errorsApiResponseError = require('../errors/ApiResponseError');

var _errorsApiResponseError2 = _interopRequireDefault(_errorsApiResponseError);

var QueryAggregate = (function () {
  /**
   * @param  {?String} name
   */

  function QueryAggregate() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    _classCallCheck(this, QueryAggregate);

    this.name = name;
    this.groupBys = [];
    this.metrics = [];
  }

  /**
   * @param {String|Object} field - Can be string (field) or object for more complex descriptions
   * @param {?Array<{value, ?metadata}>} terms
   * Example of Terms format
   * [
   *   {
   *     value: 301,
   *     metadata: { label: 'Redirections' },
   *   },
   *   {
   *     value: 404,
   *     metadata: { label: 'Page Not Found' },
   *   }
   * ]
   */

  _createClass(QueryAggregate, [{
    key: 'addTermGroupBy',
    value: function addTermGroupBy(field) {
      var terms = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var termGroupBy = new _QueryTermGroupBy2['default'](field, terms);
      this.groupBys = this.groupBys.concat(termGroupBy);
      return this;
    }

    /**
     * Alias for addTermGroupBy
     * @param {String|Object} field - Can be string (field) or object for more complex descriptions
     */
  }, {
    key: 'addGroupBy',
    value: function addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    /**
     * @param {String} field
     * @param {Array<{?from, ?to, ?metadata}>} ranges
     * Example of ranges format
     * [
     *   {
     *     from: 0,
     *     to: 500,
     *     metadata: { label: 'Fast' },
     *   },
     *   {
     *     from: 500,
     *     metadata: { label: 'Quite slow' },
     *   }
     * ]
     */
  }, {
    key: 'addRangeGroupBy',
    value: function addRangeGroupBy(field, ranges) {
      var rangeGroupBy = new _QueryRangeGroupBy2['default'](field, ranges);
      this.groupBys = this.groupBys.concat(rangeGroupBy);
      return this;
    }

    /**
     * @return {Array<QueryTermGroupBy||QueryRangeGroupBy>}
     */
  }, {
    key: 'getGroupBys',
    value: function getGroupBys() {
      return this.groupBys;
    }

    /**
     * @param {String} operation
     * @param {?String} field    Field is a mandatory if operation is different from 'count'
     */
  }, {
    key: 'addMetric',
    value: function addMetric(operation) {
      var field = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.metrics = this.metrics.concat({
        operation: operation,
        field: field
      });
      return this;
    }

    /**
     * @return {Array<{operation, ?field}>}
     */
  }, {
    key: 'getMetrics',
    value: function getMetrics() {
      return this.metrics;
    }

    /**
     * Generates the JSON object needed to call the API
     * @return {Object}
     */
  }, {
    key: 'toJsonAPI',
    value: function toJsonAPI() {
      return (0, _lodashOmit2['default'])({
        group_by: this.groupBys.map(function (groupby) {
          return groupby.toJsonAPI();
        }),
        metrics: this.metrics.map(function (metric) {
          if (metric.operation === 'count') {
            return metric.operation;
          }
          return _defineProperty({}, metric.operation, metric.field);
        })
      }, function (v) {
        return (0, _lodashIsundefined2['default'])(v) || (0, _lodashIsempty2['default'])(v);
      });
    }
  }, {
    key: 'processResponse',
    value: function processResponse(aggResponse) {
      var _this = this;

      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var transformTermKeys = _ref2.transformTermKeys;
      var injectMetadata = _ref2.injectMetadata;

      if (!aggResponse) {
        throw new _errorsApiResponseError2['default']('missing agg');
      }
      if (this.groupBys.length === 0) {
        return aggResponse;
      }
      if (!aggResponse.groups) {
        throw new _errorsApiResponseError2['default']('missing groups whereas groupby(s) have been defined');
      }

      return _extends({}, aggResponse, {
        groups: aggResponse.groups.map(function (group) {
          return _this._processGroupResponse(group, {
            transformTermKeys: transformTermKeys,
            injectMetadata: injectMetadata
          });
        })
      });
    }
  }, {
    key: '_processGroupResponse',
    value: function _processGroupResponse(groupResponse, _ref3) {
      var _this2 = this;

      var transformTermKeys = _ref3.transformTermKeys;
      var injectMetadata = _ref3.injectMetadata;

      if (!groupResponse) {
        throw new _errorsApiResponseError2['default']('missing group');
      }
      if (!groupResponse.key) {
        throw new _errorsApiResponseError2['default']('missing group key');
      }
      if (groupResponse.key.length !== this.groupBys.length) {
        throw new _errorsApiResponseError2['default']('missing group key items');
      }
      return _extends({}, groupResponse, {
        key: groupResponse.key.map(function (keyItem, i) {
          return _this2.groupBys[i].applyKeyReducers(keyItem, {
            transformTermKeys: transformTermKeys,
            injectMetadata: injectMetadata
          });
        })
      });
    }
  }]);

  return QueryAggregate;
})();

exports['default'] = QueryAggregate;
exports.ApiResponseError = _errorsApiResponseError2['default'];