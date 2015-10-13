import find from'lodash.find';
import map from'lodash.map';


class Query {

    constructor(name = '') {
      this._aggregates = this._aggregates || [];
      this._query = this._query || [];
      this._query.fields = this._query.fields || [];
      this.name = name;
    }
    // aggregates
    addAggregate(aggregate) {
      // @TODO validate QueryAggregate instance
      this._aggregates = this._aggregates.concat(aggregate);
      return this;
    }
    getAggregate(name) {
      return find(this._aggregates, agg => {
        return agg.name === name;
      });
    }

    // Filters
    setFilters(filters) {
      // @TODO validate object type
      this._query.filters = filters;
      return this;
    }
    getFilters() {
      return this._query.filters;
    }

    // Sort
    getName() {
      return this.name;
    }

    // Generates the JSON object needed to call the API
    toJsonAPI() {
      let agg;
      let aggregates;
      let json;
      aggregates = (function() { //eslint-disable-line
        let _i;
        let _len;
        let _ref;
        let _results;
        _ref = this._aggregates;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          agg = _ref[_i];
          _results.push(agg.toJsonAPI());
        }
        return _results;
      }).call(this);

      json = {};
      if (this._query.filters) {
        json.filters = this._query.filters;
      }
      if (aggregates.length) {
        json.aggs = aggregates;
      }
      return json;
    }

    fromObject(object) {
      return true;
    }

}

export default Query;
