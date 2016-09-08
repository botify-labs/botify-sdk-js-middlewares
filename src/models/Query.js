import isArray from 'lodash.isarray';
import isEmpty from 'lodash.isempty';
import isPlainObject from 'lodash.isplainobject';
import isUndefined from 'lodash.isundefined';
import omit from 'lodash.omit';

import QueryAggregate from './QueryAggregate';
import ApiResponseError from '../errors/ApiResponseError';


class Query {

  /**
   * @param  {String?} controllerId
   * @param  {String?} operationId
   * Note: other signature constructor(operationId: String?)
   */
  constructor(controllerId, operationId) {
    this.aggregates = [];
    this.filters = null;
    this.fields = [];
    this.sorts = [];
    this.operation = {};
    this.page = null;
    this.pageSize = 100;

    if (controllerId && operationId) {
      this.operation = {
        controllerId,
        operationId,
      };
    } else if (controllerId && !operationId) {
      this.operation = {
        operationId: controllerId,
      };
    }
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
   * @param {Array<string>} fieldId
   */
  setFields(fields) {
    if (!isArray(fields)) {
      throw new Error('fields must be an array of string');
    }
    this.fields = [];
    fields.forEach(field => this.addField(field));
    return this;
  }

  /**
   * @param {string} field
   */
  addField(field) {
    if (typeof field !== 'string') {
      throw new Error('field must be a string');
    }
    this.fields = this.fields.concat(field);
    return this;
  }

  getFields() {
    return this.fields;
  }


  /**
   * @param {Array<Sort>} sorts with Sort => {field: string, order: string}
   */
  setSorts(sorts) {
    if (!isArray(sorts)) {
      throw new Error('sorts must be an array of {field: string, order: string}');
    }
    this.sorts = [];
    sorts.forEach(sort => this.addSort(sort.field, sort.order));
    return this;
  }

  /**
   * @param {string} field
   */
  addSort(field, order = 'desc') {
    if (typeof field !== 'string') {
      throw new Error('field must be a string');
    }
    if (order !== 'desc' && order !== 'asc') {
      throw new Error(`order must be either 'desc' or 'asc'`);
    }
    this.sorts = this.sorts.concat({
      field,
      order,
    });
    return this;
  }

  getSorts() {
    return this.sorts;
  }


  getOperation() {
    return this.operation;
  }

  getPage() {
    return this.page;
  }

  setPage(page) {
    this.page = page;
    return this;
  }

  getPageSize() {
    return this.pageSize;
  }

  setPageSize(pageSize) {
    this.pageSize = pageSize;
    return this;
  }

  /**
   * Generates the BQLQuery JSON object
   * @return {Object}
   */
  toBQLQuery() {
    return omit({
      filters: this.filters,
      fields: this.fields,
      sort: this.sorts.map(sort => ({
        [sort.field]: { order: sort.order },
      })),
    }, v => isUndefined(v) || isEmpty(v));
  }

  /**
   * Generates the toBQLAggsQuery JSON object
   * @return {Object}
   */
  toBQLAggsQuery() {
    return omit({
      aggs: this.aggregates.map(agg => agg.toJsonAPI()),
      filters: this.filters,
    }, v => isUndefined(v) || isEmpty(v));
  }

  /**
   * @param  {Object} def
   * @return {}
   */
  static fromObject(def) {
    throw new Error('Not implemented yet');
  }


  processResponse(response, {transformTermKeys, injectMetadata} = {}) {
    if (!response) {
      throw new ApiResponseError('missing response');
    }
    if (this.aggregates.length === 0) {
      return response;
    }
    if (!response.aggs) {
      throw new ApiResponseError('missing aggs whereas aggregate(s) have been defined');
    }

    response = this.normalizeAggs(response); // eslint-disable-line no-param-reassign
    if (response.aggs.length !== this.aggregates.length) {
      throw new ApiResponseError('missing agg items');
    }
    return {
      ...response,
      aggs: response.aggs.map((agg, i) => {
        return this.aggregates[i].processResponse(agg, {
          transformTermKeys,
          injectMetadata,
        });
      }),
    };
  }

  normalizeAggs(response) {
    if (response.count !== 0 || response.aggs.length !== 0) {
      return response;
    }
    return {
      ...response,
      aggs: this.aggregates.map(() => {
        return {
          groups: [],
        };
      }),
    };
  }
}

export default Query;
export {
  ApiResponseError,
};
