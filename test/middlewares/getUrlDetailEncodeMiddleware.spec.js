import chai from 'chai';
import sinon from 'sinon';

import getUrlDetailEncodeMiddleware from '../../src/middlewares/getUrlDetailEncodeMiddleware';


describe('getUrlDetailEncodeMiddleware', () => {
  const middlewareAPI = { controllerId: 'AnalysisController', operationId: 'getUrlDetail' };
  const nextHandler = getUrlDetailEncodeMiddleware(middlewareAPI);

  it('must encode url param', () => {
    const params = {a: 'a', url: 'http://example.com/boo'};
    const callback = () => {};
    const options = {opt: 'opt'};
    const getUrlDetail = sinon.spy();

    nextHandler(getUrlDetail)(params, callback, options);
    chai.expect(getUrlDetail.calledWith({
      ...params,
      url: encodeURIComponent(params.url),
    }, callback, options)).to.be.true;
  });

  it('must alter anything if not a getUrlDetail operation', () => {
    const otherNextHandler = getUrlDetailEncodeMiddleware({ controllerId: 'foo', operationId: 'bar' });

    const params = {a: 'a'};
    const callback = () => {};
    const options = {opt: 'opt'};
    const getUrlDetail = sinon.spy();

    otherNextHandler(getUrlDetail)(params, callback, options);
    chai.expect(getUrlDetail.calledWith(params, callback, options)).to.be.true;
  });
});
