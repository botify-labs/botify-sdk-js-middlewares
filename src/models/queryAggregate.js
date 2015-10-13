import QueryRangeGroupBy from './queryRangeGroupBy';
import QueryTermGroupBy from './queryTermGroupBy';

class QueryAggregate {
    /**
     * [constructor description]
     * @param  {String} name [description]
     * @return {QueryAggregate Class}      [description]
     */
    constructor(name) {
      this.name = name;
      this.groupBy = [];
      this.metrics = [];
    }

    /**
     * [addTermGroupBy description]
     * @param {String} field [description]
     * @param {Array}  terms [description]
     */
    addTermGroupBy(field, terms = []) {
      const termGroupBy = new QueryTermGroupBy(field, terms);
      this.groupBy = this.groupBy.concat(termGroupBy);
      return this;
    }

    /**
     * [addGroupBy description]
     * @param {String} field [description]
     */
    addGroupBy(field) {
      return this.addTermGroupBy(field);
    }

    /**
     * [addRangeGroupBy description]
     * @param {[String} field  [description]
     * @param {Array} ranges [description]
     */
    addRangeGroupBy(field, ranges) {
      const rangeGroupBy = new QueryRangeGroupBy(field, ranges);
      this.groupBy = this.groupBy.concat(rangeGroupBy);
      return this;
    }
    getGroupBys() {
      return this.groupBy;
    }

    /**
     * [addMetric description]
     * @param {String} operation [description]
     * @param {String || null} field     [description]
     */
    addMetric(operation, field = null) {
      const metric = { [operation]: field};
      this.metrics.push(metric);
      return this;
    }
    getMetrics() {
      return this.metrics;
    }

    toJsonAPI() {
      const json = {};
      if (this.groupBy) {
        let groupByList = [];
        groupByList = this.groupBy.map(groupby => {
          return typeof groupby === 'string' ? groupby : groupby.toJsonAPI();
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
