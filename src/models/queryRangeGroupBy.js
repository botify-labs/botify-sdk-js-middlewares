import map from 'lodash.map';
import cloneDeep from 'lodash.clonedeep';

class QueryRangeGroupBy {
    constructor(field, rangesList = []) {
      this.field = field;
      this.rangesList = rangesList;
    }

    toJSON() {
      const ranges = cloneDeep(this.rangesList);
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
