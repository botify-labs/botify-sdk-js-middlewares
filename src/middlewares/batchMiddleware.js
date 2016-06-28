import get from 'lodash.get';
import find from 'lodash.find';
import findIndex from 'lodash.findindex';
import flatten from 'lodash.flatten';
import isArray from 'lodash.isarray';
import pick from 'lodash.pick';
import pluck from 'lodash.pluck';
import set from 'lodash.set';
import omit from 'lodash.omit';
import objectHash from 'object-hash';


export const DEFAULT_BATCHED_OPERATIONS = [
  {
    controllerId: 'AnalysisController',
    operationId: 'getUrlsAggs',
    commonKeys: ['username', 'projectSlug', 'analysisSlug', 'area'],
    batchedKeyPath: ['urlsAggsQueries'],
    queueLimit: 15,
  },
];


class Queue {
  /**
   * @param  {Func}   operation
   * @param  {Object} params
   * @param  {String || Array<String>} paramKeyBached
   */
  constructor(operation, params, paramKeyBached, queueLimit = null, timeout = 0, options = {}) {
    this.operation = operation;
    this.params = params;
    this.bachedKey = paramKeyBached;
    this.queueLimit = queueLimit;
    this.timeout = timeout;
    this.options = options;

    this.resources = [];
    this.onRequestListeners = [];
    this.sent = false;
  }

  /**
   * @param {Array<Item>} items
   * @param {Function}    callback
   */
  addResource(items, callback) {
    if (!isArray(items)) {
      throw new Error('items must be an array');
    }
    this.resources.push({
      items,
      callback,
    });
    this._requestIfNeed();
  }

  addOnRequestListener(handler) {
    this.onRequestListeners.push(handler);
  }

  _requestIfNeed() {
    if (this.resources.length === 1) {
      setTimeout(() => {
        this._request();
      }, this.timeout);
    }
    if (this.queueLimit && this.resources.length >= this.queueLimit) {
      this._request();
    }
  }

  _request() {
    if (this.sent) {
      return;
    }

    this.sent = true;
    this._onRequest();

    const batchedItems = flatten(pluck(this.resources, 'items'));
    const params = set(this.params, this.bachedKey, batchedItems);

    this.operation(
      params,
      (error, result) => {
        let resultIndex = 0;
        this.resources.forEach(({items, callback}) => {
          if (error) {
            return callback(error);
          }
          if (!result) {
            return callback({
              errorMessage: 'API returned an empty body',
              errorCode: 200,
              errorResponse: result,
            });
          }
          const itemsResults = items.map(item => result[resultIndex++]);

          function isResultOK(res) {
            if (isArray(res)) {
              return res.every(isResultOK);
            }
            if (!!res.error) {
              callback({
                errorMessage: `A resource failed`,
                errorCode: res.status,
                errorResponse: res,
              });
              return false;
            }
            return true;
          }

          const noError = isResultOK(itemsResults);
          if (noError) {
            return callback(null, itemsResults.map(itemResult => {
              if (isArray(itemResult)) {
                return itemResult.map(this._formatResponse);
              }
              return this._formatResponse(itemResult);
            }));
          }
        });
      },
      this.options,
    );
  }

  _formatResponse(result) {
    return {
      ...omit(result, ['error', 'data']),
      ...result.data,
    };
  }

  _onRequest() {
    this.onRequestListeners.forEach(handler => handler());
  }
}

const queues = {};

/**
 * @param  {?Array<{controllerId, operationId, commonKeys, batchedKeyPath, queueLimit}>} batchedOperations
 * @param  {Integer} timeout
 * @return {Middleware}
 * @warning This middleware do not propagate operation options
 */
export default function({
  batchedOperations = DEFAULT_BATCHED_OPERATIONS,
  timeout = 0,
} = {}) {
  return function batchMiddleware({controllerId, operationId}) {
    return next => function(params, callback, {batch = true} = {}) {
      const options = omit(arguments[2], ['batch']);
      const batchOperation = batch && find(batchedOperations, bo => bo.controllerId === controllerId && bo.operationId === operationId);

      if (!batchOperation) {
        return next(params, callback, options);
      }

      const hash = objectHash({
        commonParams: pick(params, batchOperation.commonKeys),
        options,
        controllerId,
        operationId,
      });

      const createQueue = !queues[hash];
      if (createQueue) {
        queues[hash] = new Queue(
          next,
          params,
          batchOperation.batchedKeyPath,
          batchOperation.queueLimit,
          timeout,
          options,
        );
        queues[hash].addOnRequestListener(() => queues[hash] = null);
      }

      const batchedItems = get(params, batchOperation.batchedKeyPath);
      queues[hash].addResource(batchedItems, callback);

      return false;
    };
  };
}
