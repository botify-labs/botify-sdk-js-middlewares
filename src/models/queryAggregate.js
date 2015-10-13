import QueryRangeGroupBy from './queryRangeGroupBy';
import QueryTermGroupBy from './queryTermGroupBy';

class QueryAggregate {
    /**
     * [constructor]
     * @param  {String} name
     * @return {QueryAggregate Class}
     */
    constructor(name) {
      this.name = name;
      this.groupBys = [];
      this.metrics = [];
    }

    /**
     * [addTermGroupBy]
     * @param {String} field
     * @param {Array}  terms
     */
    addTermGroupBy(field, terms = []) {
      const termGroupBy = new QueryTermGroupBy(field, terms);
      this.groupBys = this.groupBys.concat(termGroupBy);
      return this;
    }

    /**
     * [addGroupBy]
     * @param {String} field
     */
    addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    /**
     * [addRangeGroupBy]
     * @param {[String} field
     * @param {Array} ranges
     */
    addRangeGroupBy(field, ranges) {
      const rangeGroupBy = new QueryRangeGroupBy(field, ranges);
      this.groupBys = this.groupBys.concat(rangeGroupBy);
      return this;
    }
    getGroupBys() {
      return this.groupBys;
    }

    /**
     * [addMetric]
     * @param {String} operation
     * @param {String || null} field
     */
    addMetric(operation, field = null) {
      this.metrics = this.metrics.concat({
        operation,
        field,
      });
      return this;
    }
    getMetrics() {
      return this.metrics;
    }

    toJsonAPI() {
      const json = {};
      if (this.groupBys) {
        json.group_by = this.groupBys.map(groupby => {
          return groupby.toJsonAPI();
        });
      }
      if (this.metrics) {
        json.metrics = this.metrics.map(metric => ({
          [metric.operation]: metric.field,
        }));
      }
      return json;
    }
}

export default QueryAggregate;
