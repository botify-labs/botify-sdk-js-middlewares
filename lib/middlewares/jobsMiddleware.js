'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _lodashIsundefined = require('lodash.isundefined');

var _lodashIsundefined2 = _interopRequireDefault(_lodashIsundefined);

var JOBS = [{
  create: { controllerId: 'AnalysisController', operationId: 'createUrlsExport' },
  poll: { controllerId: 'AnalysisController', operationId: 'getUrlsExportStatus', jobIdKey: 'urlExportId' }
}, {
  create: { controllerId: 'AnalysisController', operationId: 'createPDFExport' },
  poll: { controllerId: 'AnalysisController', operationId: 'getPdfExportStatus', jobIdKey: 'pdfExportId' }
}, {
  create: { controllerId: 'SegmentController', operationId: 'createDryRun' },
  poll: { controllerId: 'SegmentController', operationId: 'getDryRunSegmentStatus', jobIdKey: 'dryRunId' }
}];

exports['default'] = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$jobs = _ref.jobs;
  var jobs = _ref$jobs === undefined ? JOBS : _ref$jobs;
  var _ref$pollInterval = _ref.pollInterval;
  var pollInterval = _ref$pollInterval === undefined ? 5000 : _ref$pollInterval;

  return function jobsMiddleware(_ref2) {
    var controllerId = _ref2.controllerId;
    var operationId = _ref2.operationId;
    var baseSdk = _ref2.baseSdk;

    return function (next) {
      return function (params, callback, options) {
        var job = (0, _lodashFind2['default'])(jobs, function (_ref3) {
          var create = _ref3.create;
          return create.controllerId === controllerId && create.operationId === operationId;
        });
        if (!job) {
          return next.apply(undefined, arguments);
        }

        next(params, function (error, response) {
          if (error) {
            return callback(_extends({}, error, {
              errorMessage: 'Error while creating job'
            }));
          }

          var interval = setInterval(function () {
            baseSdk[job.poll.controllerId][job.poll.operationId](_extends({}, params, _defineProperty({}, job.poll.jobIdKey, response.job_id)), function (err, pollResponse) {
              var fail = err || pollResponse.job_status === 'FAILED' || pollResponse.job_status === 'DONE' && (0, _lodashIsundefined2['default'])(pollResponse.results);
              if (fail) {
                clearInterval(interval);
                return callback(_extends({}, err, {
                  errorMessage: 'Error while polling result'
                }));
              }

              if (pollResponse.job_status === 'DONE') {
                clearInterval(interval);
                callback(null, pollResponse.results);
              }
            });
          }, pollInterval);
        }, options);
      };
    };
  };
};

module.exports = exports['default'];