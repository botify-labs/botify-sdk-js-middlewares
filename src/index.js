import applyMiddleware from './applyMiddleware';
import apiErrorMiddleware from './middlewares/apiErrorMiddleware';
import lscacheMiddleware from './middlewares/lscacheMiddleware';

export {
  applyMiddleware,
  middlewares: {
    apiErrorMiddleware,
    lscacheMiddleware,
  },
};
