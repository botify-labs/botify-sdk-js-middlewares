import QueryRangeGroupBy from './queryRangeGroupBy';
import QueryTermGroupBy from './queryTermGroupBy';
import map from 'lodash.map';

class QueryAggregate { // eslint-disable-line no-unused-vars

    constructor(name) {
      this.name = name;
      this.group_by = this.group_by || [];
      this.metrics = this.metrics || [];
    }

    /**
     * [addTermGroupBy description]
     * @param {String} field [description]
     * @param {Array}  terms [description]
     */
    addTermGroupBy(field, terms = []) {
      const termGroupBy = new QueryTermGroupBy(field, terms);
      this.group_by = this.group_by.concat(termGroupBy);
      return this;
    }

    // @param {String || QueryRangeGroupBy} group_by [Group by field name or by a QueryRangeGroupBy]
    addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    addRangeGroupBy(field, ranges) {
      const rangeGroupBy = new QueryRangeGroupBy(field, ranges);
      this.group_by = this.group_by.concat(rangeGroupBy);
      return this;
    }
    getGroupBys() {
      return this.group_by;
    }

    addMetric(operation, field) {
      const metric = { [operation]: field};
      this.metrics.push(metric);
      return this;
    }
    getMetrics() {
      return this.metrics;
    }

    toJsonAPI() {
      let json = {}; //eslint-disable-line
      if (this.group_by) {
        let groupByList = [];
        map(this.group_by, value => {
          if (typeof value === 'string') {
            groupByList = groupByList.concat(value);
          } else {
            groupByList = groupByList.concat(value.toJsonAPI());
          }
        });
        json.group_by = groupByList;
      }
      if (this.metrics) {
        json.metrics = this.metrics;
      }
      return json;
    }
}

export default QueryAggregate;
