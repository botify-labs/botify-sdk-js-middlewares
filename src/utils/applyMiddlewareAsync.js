import isPlainObject from 'lodash.isplainobject';


function compose(...middlewares) {
  return initial => middlewares.reduceRight((prev, next) => next(prev), initial);
}

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

    middlewareAPI = isPlainObject(middlewareAPI) ? (length--, middlewareAPI) : undefined;
    middlewares = middlewares.slice(0, length); // eslint-disable-line no-param-reassign

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    return compose(...chain)(func);
  };
}
