import endsWith from 'lodash.endswith';

import applyMiddlewareAsync from './utils/applyMiddlewareAsync';


export function applyMiddlewareController(...middlewares) {
  return (controller, controllerId, baseSdk) => {
    return Object.getOwnPropertyNames(controller).reduce((res, key) => {
      const middlewareAPI = {
        controllerId,
        operationId: key,
        baseSdk,
      };
      return {
        ...res,
        [key]: applyMiddlewareAsync(...middlewares.concat(middlewareAPI))(controller[key]),
      };
    }, {});
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
    return Object.keys(sdk).reduce((res, key) => {
      const isController = endsWith(key, 'Controller');
      return {
        ...res,
        [key]: isController ? applyMiddlewareController(...middlewares)(sdk[key], key, sdk) : sdk[key],
      };
    }, {});
  };
}
