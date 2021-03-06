import isEmpty from 'lodash.isempty';
import isUndefined from 'lodash.isundefined';
import omit from 'lodash.omit';

import QueryRangeGroupBy from './QueryRangeGroupBy';
import QueryTermGroupBy from './QueryTermGroupBy';
import ApiResponseError from '../errors/ApiResponseError';


class QueryAggregate {
  /**
   * @param  {?String} name
   */
  constructor(name = '') {
    this.name = name;
    this.groupBys = [];
    this.metrics = [];
  }

  /**
   * @param {String|Object} field - Can be string (field) or object for more complex descriptions
   * @param {?Array<{value, ?metadata}>} terms
   * Example of Terms format
   * [
   *   {
   *     value: 301,
   *     metadata: { label: 'Redirections' },
   *   },
   *   {
   *     value: 404,
   *     metadata: { label: 'Page Not Found' },
   *   }
   * ]
   */
  addTermGroupBy(field, terms = []) {
    const termGroupBy = new QueryTermGroupBy(field, terms);
    this.groupBys = this.groupBys.concat(termGroupBy);
    return this;
  }

  /**
   * Alias for addTermGroupBy
   * @param {String|Object} field - Can be string (field) or object for more complex descriptions
   */
  addGroupBy(field) {
    return this.addTermGroupBy(field);
  }

  /**
   * @param {String} field
   * @param {Array<{?from, ?to, ?metadata}>} ranges
   * Example of ranges format
   * [
   *   {
   *     from: 0,
   *     to: 500,
   *     metadata: { label: 'Fast' },
   *   },
   *   {
   *     from: 500,
   *     metadata: { label: 'Quite slow' },
   *   }
   * ]
   */
  addRangeGroupBy(field, ranges) {
    const rangeGroupBy = new QueryRangeGroupBy(field, ranges);
    this.groupBys = this.groupBys.concat(rangeGroupBy);
    return this;
  }

  /**
   * @return {Array<QueryTermGroupBy||QueryRangeGroupBy>}
   */
  getGroupBys() {
    return this.groupBys;
  }

  /**
   * @param {String} operation
   * @param {?String} field    Field is a mandatory if operation is different from 'count'
   */
  addMetric(operation, field = null) {
    this.metrics = this.metrics.concat({
      operation,
      field,
    });
    return this;
  }

  /**
   * @return {Array<{operation, ?field}>}
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Generates the JSON object needed to call the API
   * @return {Object}
   */
  toJsonAPI() {
    return omit({
      group_by: this.groupBys.map(groupby => groupby.toJsonAPI()),
      metrics: this.metrics.map(metric => {
        if (metric.operation === 'count') {
          return metric.operation;
        }
        return {
          [metric.operation]: metric.field,
        };
      }),
    }, v => isUndefined(v) || isEmpty(v));
  }

  processResponse(aggResponse, {transformTermKeys, injectMetadata} = {}) {
    if (!aggResponse) {
      throw new ApiResponseError('missing agg');
    }
    if (this.groupBys.length === 0) {
      return aggResponse;
    }
    if (!aggResponse.groups) {
      throw new ApiResponseError('missing groups whereas groupby(s) have been defined');
    }

    return {
      ...aggResponse,
      groups: aggResponse.groups.map(group => {
        return this._processGroupResponse(group, {
          transformTermKeys,
          injectMetadata,
        });
      }),
    };
  }

  _processGroupResponse(groupResponse, {transformTermKeys, injectMetadata}) {
    if (!groupResponse) {
      throw new ApiResponseError('missing group');
    }
    if (!groupResponse.key) {
      throw new ApiResponseError('missing group key');
    }
    if (groupResponse.key.length !== this.groupBys.length) {
      throw new ApiResponseError('missing group key items');
    }
    return {
      ...groupResponse,
      key: groupResponse.key.map((keyItem, i) => {
        return this.groupBys[i].applyKeyReducers(keyItem, {
          transformTermKeys,
          injectMetadata,
        });
      }),
    };
  }
}

export default QueryAggregate;
export {
  ApiResponseError,
};
