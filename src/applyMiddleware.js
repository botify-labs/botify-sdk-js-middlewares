import mapValues from 'lodash.mapvalues';
import endsWith from 'lodash.endswith';

import applyMiddlewareAsync from './utils/applyMiddlewareAsync';


/**
 * Apply middleware(s) on sdk's controllers
 * @metaParam {...Middleware} middlewares
 * @param     {SDK} sdk Object<Controllers|any>
 * @return    {SDK}
 */
export default function applyMiddleware(...middlewares) {
  return sdk => {
    return mapValues(sdk, (value, key) => {
      const isController = endsWith(key, 'Controller');
      return isController ? applyMiddlewareController(...middlewares)(value) : value;
    });
  };
}

export function applyMiddlewareController(...middlewares) {
  return (controller, contollerId) => {
    return mapValues(controller, (operation, operationId) => {
      const middlewareAPI = {
        contollerId,
        operationId,
        operation,
      };
      return applyMiddlewareAsync(...middlewares.concat(middlewareAPI))(operation);
    });
  }
}
