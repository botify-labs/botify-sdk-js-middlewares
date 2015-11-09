import endsWith from 'lodash.endswith';
import mapValues from 'lodash.mapvalues';

import applyMiddlewareAsync from './utils/applyMiddlewareAsync';


export function applyMiddlewareController(...middlewares) {
  return (controller, controllerId) => {
    return mapValues(controller, (operation, operationId) => {
      const middlewareAPI = {
        controllerId,
        operationId,
      };
      return applyMiddlewareAsync(...middlewares.concat(middlewareAPI))(operation);
    });
  };
}

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
      return isController ? applyMiddlewareController(...middlewares)(value, key) : value;
    });
  };
}
