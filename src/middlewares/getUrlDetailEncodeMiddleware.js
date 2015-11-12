const CONTROLLER_ID = 'AnalysisController';
const OPERATION_ID = 'getUrlDetail';


export default function getUrlDetailEncodeMiddleware({controllerId, operationId}) {
  return next => function(params, callback, options) {
    if (controllerId !== CONTROLLER_ID || operationId !== OPERATION_ID) {
      return next(...arguments);
    }
    next(
      {
        ...params,
        url: encodeURIComponent(params.url),
      },
      callback,
      options
    );
  };
}
