'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsempty = require('lodash.isempty');

var _lodashIsempty2 = _interopRequireDefault(_lodashIsempty);

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

var _lodashIsundefined = require('lodash.isundefined');

var _lodashIsundefined2 = _interopRequireDefault(_lodashIsundefined);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _QueryAggregate = require('./QueryAggregate');

var _QueryAggregate2 = _interopRequireDefault(_QueryAggregate);

var _errorsApiResponseError = require('../errors/ApiResponseError');

var _errorsApiResponseError2 = _interopRequireDefault(_errorsApiResponseError);

var Query = (function () {
  /**
   * @param  {?String} name
   */

  function Query() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    _classCallCheck(this, Query);

    this.aggregates = [];
    this.filters = null;
    this.name = name;
  }

  /**
   * @param {QueryAggregate} aggregate
   */

  _createClass(Query, [{
    key: 'addAggregate',
    value: function addAggregate(aggregate) {
      if (!(aggregate instanceof _QueryAggregate2['default'])) {
        throw new Error('aggregate must be an instance of QueryAggregate');
      }
      this.aggregates = this.aggregates.concat(aggregate);
      return this;
    }

    /**
     * @return {Array<QueryAggregate>}
     */
  }, {
    key: 'getAggregates',
    value: function getAggregates() {
      return this.aggregates;
    }

    /**
     * @param {Object} filters
     */
  }, {
    key: 'setFilters',
    value: function setFilters(filters) {
      if (filters && !(0, _lodashIsplainobject2['default'])(filters)) {
        throw new Error('filters must be an object');
      }
      this.filters = filters;
      return this;
    }

    /**
     * @return {Object || null}
     */
  }, {
    key: 'getFilters',
    value: function getFilters() {
      return this.filters;
    }

    /**
     * @return {String}
     */
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }

    /**
     * Generates the JSON object needed to call the API
     * @return {Object}
     */
  }, {
    key: 'toJsonAPI',
    value: function toJsonAPI() {
      return (0, _lodashOmit2['default'])({
        aggs: this.aggregates.map(function (agg) {
          return agg.toJsonAPI();
        }),
        filters: this.filters
      }, function (v) {
        return (0, _lodashIsundefined2['default'])(v) || (0, _lodashIsempty2['default'])(v);
      });
    }

    /**
     * @param  {Object} object
     * @return {}
     */
  }, {
    key: 'fromObject',
    value: function fromObject(object) {
      throw new Error('Not implemented yet');
    }
  }, {
    key: 'processResponse',
    value: function processResponse(response) {
      var _this = this;

      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref$transformTermKeys = _ref.transformTermKeys;
      var transformTermKeys = _ref$transformTermKeys === undefined ? true : _ref$transformTermKeys;
      var _ref$injectMetadata = _ref.injectMetadata;
      var injectMetadata = _ref$injectMetadata === undefined ? true : _ref$injectMetadata;
      var _ref$normalizeBoolean = _ref.normalizeBoolean;
      var normalizeBoolean = _ref$normalizeBoolean === undefined ? true : _ref$normalizeBoolean;

      if (!response) {
        throw new _errorsApiResponseError2['default']('missing response');
      }
      if (this.aggregates.length === 0) {
        return response;
      }
      if (!response.aggs) {
        throw new _errorsApiResponseError2['default']('missing aggs whereas aggregate(s) have been defined');
      }

      response = this.normalizeAggs(response); // eslint-disable-line no-param-reassign
      if (response.aggs.length !== this.aggregates.length) {
        throw new _errorsApiResponseError2['default']('missing agg items');
      }
      return _extends({}, response, {
        aggs: response.aggs.map(function (agg, i) {
          return _this.aggregates[i].processResponse(agg, {
            transformTermKeys: transformTermKeys,
            injectMetadata: injectMetadata,
            normalizeBoolean: normalizeBoolean
          });
        })
      });
    }
  }, {
    key: 'normalizeAggs',
    value: function normalizeAggs(response) {
      if (response.count !== 0 || response.aggs.length !== 0) {
        return response;
      }
      return _extends({}, response, {
        aggs: this.aggregates.map(function () {
          return {
            groups: []
          };
        })
      });
    }
  }]);

  return Query;
})();

exports['default'] = Query;
exports.ApiResponseError = _errorsApiResponseError2['default'];