import expect from 'expect';
import sinon from 'sinon';

import applyMiddlewareAsync from '../../src/utils/applyMiddlewareAsync';


const add3ToInput = () => {
  return next => (x, callback) => {
    next(x + 3, callback);
  };
}

const add3ToOutput = () => {
  return next => (x, callback) => {
    next(
      x,
      (result) => {
        callback(result + 3);
      }
    );
  };
}

describe('applyMiddlewareAsync', () => {
  it('must not change baseFunc behaviour if no middleware is given', () => {
    const baseFunc = (x, callback) => callback(x * 2);
    const func = applyMiddlewareAsync()(baseFunc);
    let callback = sinon.spy();
    const tests = [
      {input: 1, output: 2},
      {input: 2, output: 4},
      {input: 3, output: 6},
    ];

    tests.forEach(({input, output}, i) => {
      func(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must compose middlewares that modify input', () => {
    const baseFunc = (x, callback) => callback(x * 2);
    const func = applyMiddlewareAsync(add3ToInput)(baseFunc);
    let callback = sinon.spy();
    const tests = [
      {input: 1, output: 8},
      {input: 2, output: 10},
      {input: 5, output: 16},
    ];

    tests.forEach(({input, output}, i) => {
      func(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must compose middlewares that modify output', () => {
    const baseFunc = (x, callback) => callback(x * 2);
    const func = applyMiddlewareAsync(add3ToOutput)(baseFunc);
    let callback = sinon.spy();
    const tests = [
      {input: 1, output: 5},
      {input: 2, output: 7},
      {input: 5, output: 13},
    ];

    tests.forEach(({input, output}, i) => {
      func(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });

  it('must compose multiples middlewares', () => {
    const baseFunc = (x, callback) => callback(x * 2);
    const func = applyMiddlewareAsync(add3ToInput, add3ToOutput)(baseFunc);
    let callback = sinon.spy();
    const tests = [
      {input: 1, output: 11},
      {input: 2, output: 13},
      {input: 5, output: 19},
    ];

    tests.forEach(({input, output}, i) => {
      func(input, callback);
      expect(callback.callCount).toEqual(i + 1);
      expect(callback.getCall(i).args[0]).toEqual(output);
    });
  });
});
