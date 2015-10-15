import applyMiddleware from './applyMiddleware';
import apiErrorMiddleware from './middlewares/apiErrorMiddleware';
import batchMiddleware from './middlewares/batchMiddleware';
import getQueryAggregateMiddleware from './middlewares/getQueryAggregateMiddleware';
import invalidateAnalysisMiddleware from './middlewares/invalidateAnalysisMiddleware';
import lscacheMiddleware from './middlewares/lscacheMiddleware';
import Query from './models/Query';
import QueryAggregate from './models/QueryAggregate';

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
