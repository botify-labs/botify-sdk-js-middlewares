import expect from 'expect';
import sinon from 'sinon';

import applyMiddleware, { applyMiddlewareController } from '../src/applyMiddleware';


const add3ToInput = () => {
  return next => (x, callback) => {
    next(x + 3, callback);
  };
};

const add3ToOutput = () => {
  return next => (x, callback) => {
    next(
      x,
      (result) => {
        callback(result + 3);
      }
    );
  };
};

describe('applyMiddleware', () => {
  it('must not change baseFunc behaviour if no middleware is given', () => {
    const baseSdk = {
      config: {a: 'a', b: 'b'},
      multController: {
        mult2: (x, callback) => callback(x * 2),
      },
    };
    const sdk = applyMiddleware()(baseSdk);
    const callback = sinon.spy();
    const tests = [
      {input: 1, output: 2},
      {input: 2, output: 4},
      {input: 3, output: 6},
    ];

    tests.forEach(({input, output}, i) => {
      sdk.multController.mult2(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must compose multiples middlewares', () => {
    const baseSdk = {
      config: {a: 'a', b: 'b'},
      multController: {
        mult2: (x, callback) => callback(x * 2),
      },
    };
    const sdk = applyMiddleware(add3ToInput, add3ToOutput)(baseSdk);
    const callback = sinon.spy();
    const tests = [
      {input: 1, output: 11},
      {input: 2, output: 13},
      {input: 5, output: 19},
    ];

    tests.forEach(({input, output}, i) => {
      sdk.multController.mult2(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must not change initial sdk', () => {
    const baseSdk = {
      config: {a: 'a', b: 'b'},
      multController: {
        mult2: (x, callback) => callback(x * 2),
      },
    };
    applyMiddleware(add3ToInput, add3ToOutput)(baseSdk);
    const callback = sinon.spy();
    const tests = [
      {input: 1, output: 2},
      {input: 2, output: 4},
      {input: 5, output: 10},
    ];

    tests.forEach(({input, output}, i) => {
      baseSdk.multController.mult2(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must not affect not Controller properties', () => {
    const baseSdk = {
      config: {a: 'a', b: 'b'},
      multController: {
        mult2: (x, callback) => callback(x * 2),
      },
    };
    const sdk = applyMiddleware(add3ToInput, add3ToOutput)(baseSdk);
    expect(sdk.config).toEqual(baseSdk.config);
  });

  it('must pass controllerId and operationId as argument to middleware', () => {
    const fakeMiddleware = ({controllerId, operationId}) => {
      return next => (params, callback, options) => next(params, callback, options);
    };
    const spiedMiddleware = sinon.spy(fakeMiddleware);
    const fakeSDK = {
      fakeController: {
        fakeOperation: (_, callback) => callback(),
      },
    };

    applyMiddleware(spiedMiddleware)(fakeSDK);

    expect(spiedMiddleware.calledWith({
      controllerId: 'fakeController',
      operationId: 'fakeOperation',
    })).toEqual(true);
  });
});


describe('applyMiddlewareController', () => {
  it('must not change controller behaviour if no middleware is given', () => {
    const baseController = {
      mult2: (x, callback) => callback(x * 2),
    };
    const controller = applyMiddlewareController()(baseController);
    const callback = sinon.spy();
    const tests = [
      {input: 1, output: 2},
      {input: 2, output: 4},
      {input: 3, output: 6},
    ];

    tests.forEach(({input, output}, i) => {
      controller.mult2(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must compose multiples middlewares', () => {
    const baseController = {
      mult2: (x, callback) => callback(x * 2),
    };
    const controller = applyMiddlewareController(add3ToInput, add3ToOutput)(baseController);
    const callback = sinon.spy();
    const tests = [
      {input: 1, output: 11},
      {input: 2, output: 13},
      {input: 5, output: 19},
    ];

    tests.forEach(({input, output}, i) => {
      controller.mult2(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });
});
