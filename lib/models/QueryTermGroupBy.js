'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _lodashIsarray = require('lodash.isarray');

var _lodashIsarray2 = _interopRequireDefault(_lodashIsarray);

var DEFAULT_AGG_SIZE = 300;
var DEFAULT_AGG_ORDER = {
  value: 'asc'
};

var QueryTermGroupBy = (function () {
  /**
   * @param  {Object|String} descriptor or field id
   * @return {QueryTermGroupBy Class}
   */

  function QueryTermGroupBy(descriptor) {
    var terms = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, QueryTermGroupBy);

    if (!(0, _lodashIsarray2['default'])(terms)) {
      throw new Error('terms must be an Array');
    }
    this.terms = terms;

    var isSimpleField = typeof descriptor === 'string';
    if (!isSimpleField && !descriptor.distinct) {
      throw new Error('Invalid field provided. Field must either be a string or a POJO with the \'distinct\' key.');
    }

    // Simple Aggregates use a string to define their groups
    if (isSimpleField) {
      this.field = descriptor;
      this.order = DEFAULT_AGG_ORDER;
      this.size = DEFAULT_AGG_SIZE;
    } else {
      // Complex Aggregates use an object to define their groups
      this.field = descriptor.distinct.field;
      this.order = descriptor.distinct.order || DEFAULT_AGG_ORDER;
      this.size = descriptor.distinct.size || DEFAULT_AGG_SIZE;
    }
  }

  _createClass(QueryTermGroupBy, [{
    key: 'toJsonAPI',
    value: function toJsonAPI() {
      return {
        distinct: {
          field: this.field,
          order: this.order,
          size: this.size
        }
      };
    }
  }, {
    key: 'applyKeyReducers',
    value: function applyKeyReducers(keyItem) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var transformTermKeys = _ref.transformTermKeys;
      var injectMetadata = _ref.injectMetadata;

      var key = keyItem;

      if (transformTermKeys) {
        key = this._transformTermKeys(key);
      }
      if (injectMetadata && transformTermKeys) {
        key = this._injectMetadata(key);
      }

      return key;
    }
  }, {
    key: '_transformTermKeys',
    value: function _transformTermKeys(key) {
      return {
        value: key
      };
    }
  }, {
    key: '_injectMetadata',
    value: function _injectMetadata(key) {
      var relatedTerm = (0, _lodashFind2['default'])(this.terms, function (term) {
        return term.value === key.value;
      });
      return _extends({}, key, {
        metadata: relatedTerm && relatedTerm.metadata || {}
      });
    }
  }]);

  return QueryTermGroupBy;
})();

exports['default'] = QueryTermGroupBy;
module.exports = exports['default'];