import get from 'lodash.get';
import find from 'lodash.find';
import findIndex from 'lodash.findindex';
import flatten from 'lodash.flatten';
import isArray from 'lodash.isarray';
import pick from 'lodash.pick';
import pluck from 'lodash.pluck';
import set from 'lodash.set';
import nextTick from 'next-tick';
import objectHash from 'object-hash';


export const DEFAULT_BATCHED_OPERATIONS = [
  {
    controllerId: 'AnalysisController',
    operationId: 'getUrlsAggs',
    commonKeys: ['username', 'projectSlug', 'analysisSlug'],
    batchedKeyPath: ['UrlsAggsQuery', 'queries'],
    queueLimit: 15,
  },
];

function apiErrorObject({errorMessage, errorCode, errorResponse}) {
  return {
    errorMessage,
    errorCode,
    errorResponse,
  };
}

class Queue {
  /**
   * @param  {Func}   operation
   * @param  {Object} params
   * @param  {String || Array<String>} paramKeyBached
   */
  constructor(operation, params, paramKeyBached, queueLimit = null) {
    this.operation = operation;
    this.params = params;
    this.bachedKey = paramKeyBached;
    this.queueLimit = queueLimit;

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
      nextTick(() => {
        this._request();
      });
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
            return callback(apiErrorObject({errorMessage: 'API returned an empty body'}));
          }
          const itemsResults = items.map(item => result[resultIndex++]);
          const resourceErrorIndex = findIndex(itemsResults, itemResult => !!itemResult.error);
          if (resourceErrorIndex >= 0) {
            const resourceError = itemsResults[resourceErrorIndex];
            return callback(
              apiErrorObject({
                ...resourceError.error,
              },
              resourceError.status
            ));
          }
          return callback(null, itemsResults.map(itemResult => itemResult.data));
        });
      },
    );
  }

  _onRequest() {
    this.onRequestListeners.forEach(handler => handler());
  }
}

const queues = {};

/**
 * @param  {?Array<{controllerId, operationId, commonKeys, batchedKeyPath, queueLimit}>} batchedOperations
 * @return {Middleware}
 * @warning This middleware do not propagate operation options
 */
export default function(
  batchedOperations = DEFAULT_BATCHED_OPERATIONS
) {
  return function batchMiddleware({controllerId, operationId}) {
    return next => function(params, callback, options) {
      const batchOperation = find(batchedOperations, bo => bo.controllerId === controllerId && bo.operationId === operationId);
      if (!batchOperation) {
        return next(...arguments);
      }

      const hash = objectHash({
        commonParams: pick(params, batchOperation.commonKeys),
        operationId,
      });

      const createQueue = !queues[hash];
      if (createQueue) {
        queues[hash] = new Queue(
          next,
          params,
          batchOperation.batchedKeyPath,
          batchOperation.queueLimit
        );
        queues[hash].addOnRequestListener(() => queues[hash] = null);
      }

      const batchedItems = get(params, batchOperation.batchedKeyPath);
      queues[hash].addResource(batchedItems, callback);

      return false;
    };
  };
}
