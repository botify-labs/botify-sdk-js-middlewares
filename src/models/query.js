import find from'lodash.find';
import map from'lodash.map';


class Query {

    constructor(name = '') {
      this._aggregates = this._aggregates || [];
      this.filters = this.filters || [];
      this.name = name;
    }
    // aggregates
    addAggregate(aggregate) {
      // @TODO validate QueryAggregate instance
      this._aggregates = this._aggregates.concat(aggregate);
      return this;
    }
    getAggregates() {
      return this._aggregates;
    }

    // Filters
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
      map(this._aggregates, value => {
        aggregates = aggregates.concat(value.toJsonAPI());
      });
      let json = {}; //eslint-disable-line

      if (this.filters) {
        json.filters = this.filters;
      }
      if (aggregates.length) {
        json.aggs = aggregates;
      }
      return json;
    }

}

export default Query;
