import applyMiddleware from './applyMiddleware';
import apiErrorMiddleware from './middlewares/apiErrorMiddleware';
import lscacheMiddleware from './middlewares/lscacheMiddleware';

const middlewares = {
  apiErrorMiddleware,
  lscacheMiddleware,
};

export {
  applyMiddleware,
  middlewares,
};
