import QueryAggregate from './queryAggregate';

class Query {

    constructor(name = '') {
      this.aggregates = [];
      this.filters = {};
      this.name = name;
    }

    /**
     * @param {Array} aggregate [Array of Objects]
     */
    addAggregate(aggregate) {
      if (!(aggregate instanceof QueryAggregate)) {
        throw new Error('aggregate must be an instance of QueryAggregate');
      }
      this.aggregates = this.aggregates.concat(aggregate);
      return this;
    }

    /**
     * @return {Array} [Array of Objects]
     */
    getAggregates() {
      return this.aggregates;
    }

    /**
     * @param {Object} filters
     */
    setFilters(filters) {
      if (typeof filters !== 'object') {
        throw new Error('filters must be an object');
      }
      this.filters = filters;
      return this;
    }

    /**
     * @return {Object}
     */
    getFilters() {
      return this.filters;
    }

    /**
     * @return {String}
     */
    getName() {
      return this.name;
    }

    /**
     * [toJsonAPI Generates the JSON object needed to call the API]
     */
    toJsonAPI() {
      const json = {};
      if (this.getAggregates().length > 0) {
        json.aggs = this.aggregates.map( agg => agg.toJsonAPI());
      }
      if (this.filters) {
        json.filters = this.filters;
      }
      return json;
    }

}

export default Query;
