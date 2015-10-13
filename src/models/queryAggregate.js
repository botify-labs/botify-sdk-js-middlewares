import QueryRangeGroupBy from './queryRangeGroupBy';
import map from 'lodash.map';

class QueryAggregate { // eslint-disable-line no-unused-vars

    constructor(name) {
      this.name = name;
      this._aggregate = this._aggregate || {};
      this._aggregate.group_by = this._aggregate.group_by || [];
      this._aggregate.metrics = this._aggregate.metrics || [];
    }

    addTermGroupBy(field, terms = []) {
      const termGroupBy = { field, terms };
      this._aggregate.group_by = this._aggregate.group_by.concat(termGroupBy);
      return this;
    }

    // @param {String || QueryRangeGroupBy} group_by [Group by field name or by a QueryRangeGroupBy]
    addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    addRangeGroupBy(field, ranges) {
      const rangeGroupBy = new QueryRangeGroupBy(field, ranges);
      this._aggregate.group_by = this._aggregate.group_by.concat(rangeGroupBy);
      return this;
    }
    getGroupBys() {
      return this._aggregate.group_by;
    }

    addMetric(operation, field) {
      const metric = { [operation]: field};
      this._aggregate.metrics.push(metric);
      return this;
    }
    getMetrics() {
      return this._aggregate.metrics;
    }

    toJsonAPI() {
      let json = {}; //eslint-disable-line
      if (this._aggregate.group_by) {
        let groupByList = [];
        map(this._aggregate.group_by, value => {
          if (typeof value === 'string') {
            groupByList = groupByList.concat(value);
          } else {
            groupByList = groupByList.concat(value.toJsonAPI());
          }
        });
        json.group_by = groupByList;
      }
      if (this._aggregate.metrics) {
        json.metrics = this._aggregate.metrics;
      }
      return json;
    }
}

export default QueryAggregate;
