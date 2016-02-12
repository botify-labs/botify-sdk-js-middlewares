import find from 'lodash.find';
import isArray from 'lodash.isarray';
import isUndefined from 'lodash.isundefined';
import omit from 'lodash.omit';


class QueryRangeGroupBy {
  /**
   * @param  {String} field
   * @param  {Array}  ranges
   */
  constructor(field, ranges) {
    this.field = field;
    if (!isArray(ranges)) {
      throw new Error('ranges must be an Array');
    }
    this.ranges = ranges;
  }

  toJsonAPI() {
    return {
      range: {
        field: this.field,
        ranges: this.ranges.map(range => omit({
          from: range.from,
          to: range.to,
        }, isUndefined)),
      },
    };
  }

  applyKeyReducers(keyItem, {injectMetadata} = {}) {
    let key = keyItem;

    if (injectMetadata) {
      key = this._injectMetadata(key);
    }

    return key;
  }

  _injectMetadata(key) {
    const relatedRange = find(this.ranges, range => {
      return range.to === key.to && range.from === key.from;
    });
    return {
      ...key,
      metadata: relatedRange && relatedRange.metadata || {},
    };
  }
}

export default QueryRangeGroupBy;
