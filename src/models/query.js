class Query {
    /**
     * [constructor description]
     * @param  {String} name [description]
     * @return {Query Class}      [description]
     */
    constructor(name = '') {
      this._aggregates = [];
      this.filters = [];
      this.name = name;
    }

    /**
     * [addAggregate description]
     * @param {Array} aggregate [description]
     */
    addAggregate(aggregate) {
      // @TODO validate QueryAggregate instance
      this._aggregates = this._aggregates.concat(aggregate);
      return this;
    }
    getAggregates() {
      return this._aggregates;
    }

    /**
     * [setFilters description]
     * @param {Object} filters [description]
     */
    setFilters(filters) {
      // @TODO validate object type
      this.filters = filters;
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
      let aggregates = [];
      aggregates = this._aggregates.map( agg => agg.toJsonAPI());
      const json = {};

      if (this.filters) {
        json.filters = this.filters;
      }
      if (aggregates.length > 0) {
        json.aggs = aggregates;
      }
      return json;
    }

}

export default Query;
