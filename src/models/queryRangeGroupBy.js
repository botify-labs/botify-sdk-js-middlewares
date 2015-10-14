import omit from 'lodash.omit';
import isUndefined from 'lodash.isundefined';

class QueryRangeGroupBy {
    /**
     * [constructor]
     * @param  {String} field
     * @param  {Array}  ranges
     * @return {QueryRangeGroupBy Class}
     */
    constructor(field, ranges) {
      this.field = field;
      if (!Array.isArray(ranges)) {
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
