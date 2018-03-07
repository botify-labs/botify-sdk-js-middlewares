'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsarray = require('lodash.isarray');

var _lodashIsarray2 = _interopRequireDefault(_lodashIsarray);

var _lodashIsempty = require('lodash.isempty');

var _lodashIsempty2 = _interopRequireDefault(_lodashIsempty);

var _lodashIsstring = require('lodash.isstring');

var _lodashIsstring2 = _interopRequireDefault(_lodashIsstring);

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

var _lodashIsundefined = require('lodash.isundefined');

var _lodashIsundefined2 = _interopRequireDefault(_lodashIsundefined);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _lodashConformsto = require('lodash.conformsto');

var _lodashConformsto2 = _interopRequireDefault(_lodashConformsto);

var _lodashIncludes = require('lodash.includes');

var _lodashIncludes2 = _interopRequireDefault(_lodashIncludes);

var _QueryAggregate = require('./QueryAggregate');

var _QueryAggregate2 = _interopRequireDefault(_QueryAggregate);

var _errorsApiResponseError = require('../errors/ApiResponseError');

var _errorsApiResponseError2 = _interopRequireDefault(_errorsApiResponseError);

var Query = (function () {

  /**
   * @param  {String?} controllerId
   * @param  {String?} operationId
   * Note: other signature constructor(operationId: String?)
   */

  function Query(controllerId, operationId) {
    _classCallCheck(this, Query);

    this.aggregates = [];
    this.filters = null;
    this.fields = [];
    this.sorts = [];
    this.operation = {};
    this.page = null;
    this.pageSize = 100;

    if (controllerId && operationId) {
      this.operation = {
        controllerId: controllerId,
        operationId: operationId
      };
    } else if (controllerId && !operationId) {
      this.operation = {
        operationId: controllerId
      };
    }
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
     * @param {Array<string>} fieldId
     */
  }, {
    key: 'setFields',
    value: function setFields(fields) {
      var _this = this;

      if (!(0, _lodashIsarray2['default'])(fields)) {
        throw new Error('fields must be an array of string');
      }
      this.fields = [];
      fields.forEach(function (field) {
        return _this.addField(field);
      });
      return this;
    }

    /**
     * @param {string} field
     */
  }, {
    key: 'addField',
    value: function addField(field) {
      if (!(0, _lodashIncludes2['default'])(['string', 'object'], typeof field)) {
        throw new Error('field must be either a string or an object');
      }
      if ((0, _lodashIsplainobject2['default'])(field) && !(0, _lodashConformsto2['default'])(field, {
        name: _lodashIsstring2['default'],
        'function': _lodashIsstring2['default'],
        args: _lodashIsarray2['default']
      })) {
        throw new Error('Field is not valid');
      }
      this.fields = this.fields.concat(field);
      return this;
    }
  }, {
    key: 'getFields',
    value: function getFields() {
      return this.fields;
    }

    /**
     * @param {Array<Sort>} sorts with Sort => {field: string, order: string}
     */
  }, {
    key: 'setSorts',
    value: function setSorts(sorts) {
      var _this2 = this;

      if (!(0, _lodashIsarray2['default'])(sorts)) {
        throw new Error('sorts must be an array of {field: string, order: string}');
      }
      this.sorts = [];
      sorts.forEach(function (sort) {
        return _this2.addSort(sort.field, sort.order);
      });
      return this;
    }

    /**
     * @param {string} field
     */
  }, {
    key: 'addSort',
    value: function addSort(field) {
      var order = arguments.length <= 1 || arguments[1] === undefined ? 'desc' : arguments[1];

      if (typeof field !== 'string') {
        throw new Error('field must be a string');
      }
      if (order !== 'desc' && order !== 'asc') {
        throw new Error('order must be either \'desc\' or \'asc\'');
      }
      this.sorts = this.sorts.concat({
        field: field,
        order: order
      });
      return this;
    }
  }, {
    key: 'getSorts',
    value: function getSorts() {
      return this.sorts;
    }
  }, {
    key: 'getOperation',
    value: function getOperation() {
      return this.operation;
    }
  }, {
    key: 'getPage',
    value: function getPage() {
      return this.page;
    }
  }, {
    key: 'setPage',
    value: function setPage(page) {
      if (Number(page) !== page || page % 1 !== 0) {
        throw new Error('Page number must be an integer.');
      }
      if (page < 0) {
        throw new Error('Page number cannot be a negative number.');
      }
      this.page = page;
      return this;
    }
  }, {
    key: 'getPageSize',
    value: function getPageSize() {
      return this.pageSize;
    }
  }, {
    key: 'setPageSize',
    value: function setPageSize(pageSize) {
      if (Number(pageSize) !== pageSize || pageSize % 1 !== 0) {
        throw new Error('Page size must be an integer.');
      }
      if (pageSize < 0) {
        throw new Error('Page size cannot be a negative number.');
      }
      this.pageSize = pageSize;
      return this;
    }

    /**
     * Generates the BQLQuery JSON object
     * @return {Object}
     */
  }, {
    key: 'toBQLQuery',
    value: function toBQLQuery() {
      return (0, _lodashOmit2['default'])({
        filters: this.filters,
        fields: this.fields,
        sort: this.sorts.map(function (sort) {
          return _defineProperty({}, sort.field, { order: sort.order });
        })
      }, function (v) {
        return (0, _lodashIsundefined2['default'])(v) || (0, _lodashIsempty2['default'])(v);
      });
    }

    /**
     * Generates the toBQLAggsQuery JSON object
     * @return {Object}
     */
  }, {
    key: 'toBQLAggsQuery',
    value: function toBQLAggsQuery() {
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
     * @param  {Object} def
     * @return {}
     */
  }, {
    key: 'processResponse',
    value: function processResponse(response) {
      var _this3 = this;

      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var transformTermKeys = _ref2.transformTermKeys;
      var injectMetadata = _ref2.injectMetadata;

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
          return _this3.aggregates[i].processResponse(agg, {
            transformTermKeys: transformTermKeys,
            injectMetadata: injectMetadata
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
  }], [{
    key: 'fromObject',
    value: function fromObject(def) {
      throw new Error('Not implemented yet');
    }
  }]);

  return Query;
})();

exports['default'] = Query;
exports.ApiResponseError = _errorsApiResponseError2['default'];