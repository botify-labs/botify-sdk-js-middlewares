class QueryRangeGroupBy {
    /**
     * [constructor description]
     * @param  {String} field  [description]
     * @param  {Array}  ranges [description]
     * @return {QueryRangeGroupBy Class}        [description]
     */
    constructor(field, ranges = []) {
      this.field = field;
      this.ranges = ranges;
    }

    toJsonAPI() {
      return {
        range: {
          field: this.field,
          ranges: this.ranges,
        },
      };
    }
}

export default QueryRangeGroupBy;
