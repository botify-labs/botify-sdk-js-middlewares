import isEmpty from 'lodash.isempty';
import isPlainObject from 'lodash.isplainobject';
import isUndefined from 'lodash.isundefined';
import omit from 'lodash.omit';

import QueryAggregate from './QueryAggregate';
import ApiResponseError from '../errors/ApiResponseError';


class Query {
  /**
   * @param  {?String} name
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
    if (filters && !isPlainObject(filters)) {
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

  processResponse(response, {transformTermKeys = true, injectMetadata = true, normalizeBoolean = true} = {}) {
    if (!response) {
      throw new ApiResponseError('missing response');
    }
    if (this.aggregates.length === 0) {
      return response;
    }
    if (!response.aggs) {
      throw new ApiResponseError('missing aggs whereas aggregate(s) have been defined');
    }
    if (response.aggs.length !== this.aggregates.length) {
      throw new ApiResponseError('missing agg items');
    }
    return {
      ...response,
      aggs: response.aggs.map((agg, i) => {
        return this.aggregates[i].processResponse(agg, {
          transformTermKeys,
          injectMetadata,
          normalizeBoolean,
        });
      }),
    };
  }
}

export default Query;
export {
  ApiResponseError,
};
