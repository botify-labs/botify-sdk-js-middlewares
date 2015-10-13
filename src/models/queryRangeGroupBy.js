class QueryRangeGroupBy {
    /**
     * [constructor]
     * @param  {String} field
     * @param  {Array}  ranges mandatory
     * @return {QueryRangeGroupBy Class}
     */
    constructor(field, ranges) {
      this.field = field;
      this.ranges = ranges;
    }

    toJsonAPI() {
      this.ranges.map(value => {
        return value.metadata && delete value.metadata;
      });
      return {
        range: {
          field: this.field,
          ranges: this.ranges,
        },
      };
    }
}

export default QueryRangeGroupBy;
