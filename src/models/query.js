import QueryAggregate from '../../src/models/queryAggregate';

class Query {
    /**
     * [constructor]
     * @param  {String} name
     * @return {Query Instance}
     */
    constructor(name = '') {
      this.aggregates = [];
      this.filters = [];
      this.name = name;
    }

    /**
     * [addAggregate]
     * @param {Array} aggregate
     */
    addAggregate(aggregate) {
      this.aggregates = this.aggregates.concat(aggregate instanceof QueryAggregate ? aggregate : []);
      return this;
    }
    getAggregates() {
      return this.aggregates;
    }

    /**
     * [setFilters]
     * @param {Object} filters
     */
    setFilters(filters) {
      this.filters = typeof filters === 'object' ? filters : {};
      return this;
    }
    getFilters() {
      return this.filters;
    }

    // Sort
    getName() {
      return this.name;
    }

    // Generates the JSON object needed to call the API
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
