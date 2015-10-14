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
}

export default QueryRangeGroupBy;
