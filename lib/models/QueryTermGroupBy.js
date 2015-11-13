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

var QueryTermGroupBy = (function () {
  /**
   * @param  {String} field
   * @param  {?Array} terms
   * @return {QueryTermGroupBy Class}
   */

  function QueryTermGroupBy(field) {
    var terms = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, QueryTermGroupBy);

    this.field = field;
    if (!(0, _lodashIsarray2['default'])(terms)) {
      throw new Error('terms must be an Array');
    }
    this.terms = terms;
  }

  _createClass(QueryTermGroupBy, [{
    key: 'toJsonAPI',
    value: function toJsonAPI() {
      return this.field;
    }
  }, {
    key: 'applyKeyReducers',
    value: function applyKeyReducers(keyItem) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref$transformTermKeys = _ref.transformTermKeys;
      var transformTermKeys = _ref$transformTermKeys === undefined ? true : _ref$transformTermKeys;
      var _ref$injectMetadata = _ref.injectMetadata;
      var injectMetadata = _ref$injectMetadata === undefined ? true : _ref$injectMetadata;
      var _ref$normalizeBoolean = _ref.normalizeBoolean;
      var normalizeBoolean = _ref$normalizeBoolean === undefined ? true : _ref$normalizeBoolean;

      var key = keyItem;

      if (normalizeBoolean) {
        key = this._normalizeBoolean(key);
      }
      if (transformTermKeys) {
        key = this._transformTermKeys(key);
      }
      if (injectMetadata && transformTermKeys) {
        key = this._injectMetadata(key);
      }

      return key;
    }
  }, {
    key: '_normalizeBoolean',
    value: function _normalizeBoolean(key) {
      return key === 'T' ? true : key === 'F' ? false : key;
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