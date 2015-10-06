import _ from 'lodash';

import { endsWith } from './utils/common';
import applyMiddlewareAsync from './utils/applyMiddlewareAsync';


/**
 * Apply middleware(s) on sdk's controllers
 * @metaParam {...Middleware} middlewares
 * @param     {SDK} sdk Object<Controllers|any>
 * @return    {SDK}
 */
export default function applyMiddleware(...middlewares) {
  return sdk => {
    return _.mapValues(sdk, (value, key) => {
      const isController = endsWith(key, 'Controller');
      return isController ? applyMiddlewareController(...middlewares)(value) : value;
    });
  };
}

export function applyMiddlewareController(...middlewares) {
  return controller => {
    return _.mapValues(controller, (operation, operationId) => {
      const middlewareAPI = {
        operationId,
        operation,
      };
      return applyMiddlewareAsync(...middlewares.concat(middlewareAPI))(operation);
    });
  }
}
