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

var _lodashIsundefined = require('lodash.isundefined');

var _lodashIsundefined2 = _interopRequireDefault(_lodashIsundefined);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var QueryRangeGroupBy = (function () {
  /**
   * @param  {String} field
   * @param  {Array}  ranges
   */

  function QueryRangeGroupBy(field, ranges) {
    _classCallCheck(this, QueryRangeGroupBy);

    this.field = field;
    if (!(0, _lodashIsarray2['default'])(ranges)) {
      throw new Error('ranges must be an Array');
    }
    this.ranges = ranges;
  }

  _createClass(QueryRangeGroupBy, [{
    key: 'toJsonAPI',
    value: function toJsonAPI() {
      return {
        range: {
          field: this.field,
          ranges: this.ranges.map(function (range) {
            return (0, _lodashOmit2['default'])({
              from: range.from,
              to: range.to
            }, _lodashIsundefined2['default']);
          })
        }
      };
    }
  }, {
    key: 'applyKeyReducers',
    value: function applyKeyReducers(keyItem) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var injectMetadata = _ref.injectMetadata;

      var key = keyItem || {}; // In some case key can be null

      if (injectMetadata) {
        key = this._injectMetadata(key);
      }

      return key;
    }
  }, {
    key: '_injectMetadata',
    value: function _injectMetadata(key) {
      var relatedRange = (0, _lodashFind2['default'])(this.ranges, function (range) {
        return range.to === key.to && range.from === key.from;
      });
      return _extends({}, key, {
        metadata: relatedRange && relatedRange.metadata || {}
      });
    }
  }]);

  return QueryRangeGroupBy;
})();

exports['default'] = QueryRangeGroupBy;
module.exports = exports['default'];