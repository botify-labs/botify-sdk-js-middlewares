import applyMiddleware from './applyMiddleware';
import apiErrorMiddleware from './middlewares/apiErrorMiddleware';
import batchMiddleware from './middlewares/batchMiddleware';
import invalidateAnalysisMiddleware from './middlewares/invalidateAnalysisMiddleware';
import lscacheMiddleware from './middlewares/lscacheMiddleware';

const middlewares = {
  apiErrorMiddleware,
  batchMiddleware,
  invalidateAnalysisMiddleware,
  lscacheMiddleware,
};

export {
  applyMiddleware,
  middlewares,
};
