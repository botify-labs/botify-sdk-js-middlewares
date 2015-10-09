import flatten from 'lodash.flatten';
import isArray from 'lodash.isarray';
import pick from 'lodash.pick';
import pluck from 'lodash.pluck';
import nextTick from 'next-tick';
import objectHash from 'object-hash';


export const DEFAULT_BATCHED_OPERATIONS = {
  getQueryAggregate: {
    paramKeysCommon: ['username', 'projectSlug', 'analysisSlug'],
    paramKeyBatched: 'queries',
    queueLimit: 20,
  },
};

function apiErrorObject(message, status) {
  return {
    ErrorMessage: message,
    ErrorCode: status,
  };
}

class Queue {
  /**
   * @param  {Func}   operation
   * @param  {Object} params
   * @param  {String} paramKeyBached
   * @param  {Object} options
   */
  constructor(operation, params, paramKeyBached, options, queueLimit = null) {
    this.operation = operation;
    this.params = params;
    this.bachedKey = paramKeyBached;
    this.options = options;
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

    this.operation(
      {
        ...this.params,
        [this.bachedKey]: flatten(pluck(this.resources, 'items')),
      },
      (error, result) => {
        this.resources.forEach(({callback}, i) => {
          if (error) {
            return callback(error);
          }
          if (!result) {
            return callback(apiErrorObject('API returned an empty body'));
          }
          const resourceResponse = result[i];
          const resourceError = resourceResponse.status < 200 || resourceResponse.status > 206;
          if (resourceError) {
            return callback(apiErrorObject(resourceResponse.error, resourceResponse.status));
          }
          return callback(null, resourceResponse.data);
        });
      },
      this.options
    );
  }

  _onRequest() {
    this.onRequestListeners.forEach(handler => handler());
  }
}

const queues = {};

/**
 * @param  {Map<String, {paramKeysCommon: Array<String>, paramKeyBatched: String}>} batchedOperations indexed by operationId
 * @return {Func}
 */
export default function(batchedOperations = DEFAULT_BATCHED_OPERATIONS) {
  return function batchMiddleware({operationId}) {
    return next => function(params, callback, options) {
      const batchOperation = batchedOperations[operationId];
      if (!batchOperation) {
        return next(...arguments);
      }

      const hash = objectHash({
        commonParams: pick(params, batchOperation.paramKeysCommon),
        options,
        operationId,
      });

      const createQueue = !queues[hash];
      if (createQueue) {
        queues[hash] = new Queue(
          next,
          params,
          batchOperation.paramKeyBatched,
          options,
          batchOperation.queueLimit
        );
        queues[hash].addOnRequestListener(() => queues[hash] = null);
      }

      queues[hash].addResource(params[batchOperation.paramKeyBatched], callback);

      return false;
    };
  };
}
