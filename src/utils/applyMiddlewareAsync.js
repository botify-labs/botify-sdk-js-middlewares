import _ from 'lodash';


/**
 * @metaParam {...Middlewares} middlewares
 * @metaParam {Object?} middlewareAPI
 * @param     {Func} func
 * @return    {Func}
 * Example: applyMiddlewareAsync(add3ToInput)(func)
 */
export default function applyMiddlewareAsync(...middlewares) {
  return func => {
    let length = middlewares.length;
    let middlewareAPI = length > 0 ? middlewares[length - 1] : undefined;

    middlewareAPI = _.isPlainObject(middlewareAPI) ? (length--, middlewareAPI) : undefined;
    middlewares = middlewares.slice(0, length);

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    return compose(...chain)(func);
  }
}

function compose(...middlewares) {
  return initial => middlewares.reduceRight((prev, next) => next(prev), initial);
}
