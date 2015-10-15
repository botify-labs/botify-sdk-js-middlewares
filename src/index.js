import applyMiddleware from './applyMiddleware';
import apiErrorMiddleware from './middlewares/apiErrorMiddleware';
import batchMiddleware from './middlewares/batchMiddleware';
import getQueryAggregateMiddleware from './middlewares/getQueryAggregateMiddleware';
import invalidateAnalysisMiddleware from './middlewares/invalidateAnalysisMiddleware';
import lscacheMiddleware from './middlewares/lscacheMiddleware';
import Query from './models/query';
import QueryAggregate from './models/queryAggregate';

const middlewares = {
  apiErrorMiddleware,
  batchMiddleware,
  getQueryAggregateMiddleware,
  invalidateAnalysisMiddleware,
  lscacheMiddleware,
};

const models = {
  Query,
  QueryAggregate,
};

export {
  applyMiddleware,
  middlewares,
  models,
};
