import isEmpty from 'lodash.isempty';
import isPlainObject from 'lodash.isplainobject';
import isUndefined from 'lodash.isundefined';
import omit from 'lodash.omit';

import QueryAggregate from './QueryAggregate';


class Query {

  /**
   * @param  {String} name
   */
  constructor(name = '') {
    this.aggregates = [];
    this.filters = null;
    this.name = name;
  }

  /**
   * @param {QueryAggregate} aggregate
   */
  addAggregate(aggregate) {
    if (!(aggregate instanceof QueryAggregate)) {
      throw new Error('aggregate must be an instance of QueryAggregate');
    }
    this.aggregates = this.aggregates.concat(aggregate);
    return this;
  }

  /**
   * @return {Array<QueryAggregate>}
   */
  getAggregates() {
    return this.aggregates;
  }

  /**
   * @param {Object} filters
   */
  setFilters(filters) {
    if (!isPlainObject(filters)) {
      throw new Error('filters must be an object');
    }
    this.filters = filters;
    return this;
  }

  /**
   * @return {Object || null}
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
   * Generates the JSON object needed to call the API
   * @return {Object}
   */
  toJsonAPI() {
    return omit({
      aggs: this.aggregates.map(agg => agg.toJsonAPI()),
      filters: this.filters,
    }, v => isUndefined(v) || isEmpty(v));
  }

  /**
   * @param  {Object} object
   * @return {}
   */
  fromObject(object) {
    throw new Error('Not implemented yet');
  }

}

export default Query;
