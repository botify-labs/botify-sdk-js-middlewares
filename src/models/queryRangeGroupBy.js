import map from 'lodash.map';
import cloneDeep from 'lodash.clonedeep';

class QueryRangeGroupBy {
    constructor(field, rangesList = []) {
      this.field = field;
      this.ranges_list = rangesList;
    }

    toJSON() {
      const ranges = cloneDeep(this.ranges_list);
      let range;
      map(ranges, value => {
        return value.metadata && delete range.metadata;
      });
      return {
        range: {
          field: this.field,
          ranges: ranges,
        },
      };
    }
}

export default QueryRangeGroupBy;
