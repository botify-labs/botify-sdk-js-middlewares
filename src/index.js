import applyMiddleware from './applyMiddleware';
import apiError from './middlewares/error';

export {
  applyMiddleware,
  middlewares: {
    apiError,
  },
};
