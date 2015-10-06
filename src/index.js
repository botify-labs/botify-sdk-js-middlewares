import applyMiddleware from './applyMiddleware';
import apiError from './middlewares/error';
import lscache from './middlewares/lscache';

export {
  applyMiddleware,
  middlewares: {
    apiError,
    lscache,
  },
};
