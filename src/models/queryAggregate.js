import QueryRangeGroupBy from './queryRangeGroupBy';
import QueryTermGroupBy from './queryTermGroupBy';

class QueryAggregate {
    /**
     * @param  {String} name
     * @return {QueryAggregate Class}
     */
    constructor(name) {
      this.name = name;
      this.groupBys = [];
      this.metrics = [];
    }

    /**
     * @param {String} field
     * @param {Array}  terms
     * Example of Terms format
     * [{
     *   value: 301,
     *   metadata: { label: 'Redirections' },
     * },
     * {
     *   value: 404,
     *   metadata: { label: 'Page Not Found' },
     * }]
     */
    addTermGroupBy(field, terms = []) {
      const termGroupBy = new QueryTermGroupBy(field, terms);
      this.groupBys = this.groupBys.concat(termGroupBy);
      return this;
    }

    /**
     * @param {String} field
     */
    addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    /**
     * @param {[String} field
     * @param {Array} ranges
     * Example of ranges format
     * [{
     *  from: 0,
     *   to: 500,
     *   metadata: { label: 'Fast' },
     *  },
     *  {
     *  from: 500,
     *   to: 1000,
     *   metadata: { label: 'Quite slow' },
     *  }]
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
     * @param {String} operation
     * @param {String?} field
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

    /**
     * [toJsonAPI Generates the JSON object needed to call the API]
     */
    toJsonAPI() {
      const json = {};
      if (this.groupBys) {
        json.group_by = this.groupBys.map(groupby => {
          return groupby.toJsonAPI();
        });
      }
      if (this.metrics) {
        json.metrics = this.metrics.map(metric => {
          if (metric.operation === 'count') return metric.operation;
          return { [metric.operation]: metric.field };
        });
      }
      return json;
    }
}

export default QueryAggregate;
