import find from 'lodash.find';
import isUndefined from 'lodash.isundefined';


const JOBS = [
  {
    create: { controllerId: 'AnalysisController', operationId: 'createUrlsExport' },
    poll: { controllerId: 'AnalysisController', operationId: 'getUrlsExportStatus', jobIdKey: 'urlExportId' },
  },
  {
    create: { controllerId: 'AnalysisController', operationId: 'createPdfExport' },
    poll: { controllerId: 'AnalysisController', operationId: 'getPdfExportStatus', jobIdKey: 'pdfExportId' },
  },
  {
    create: { controllerId: 'AnalysisController', operationId: 'createAdvancedExport' },
    poll: { controllerId: 'AnalysisController', operationId: 'getAdvancedExportStatus', jobIdKey: 'advancedExportId' },
  },
  {
    create: { controllerId: 'SegmentController', operationId: 'createDryRun' },
    poll: { controllerId: 'SegmentController', operationId: 'getDryRunStatus', jobIdKey: 'dryRunId' },
  },
];

export default function({
  jobs = JOBS,
  pollInterval = 5000,
} = {}) {
  return function jobsMiddleware({ controllerId, operationId, baseSdk }) {
    return next => function(params, callback, options) {
      const job = find(jobs, ({create}) => create.controllerId === controllerId && create.operationId === operationId);
      if (!job) {
        return next(...arguments);
      }

      next(
        params,
        function(error, response) {
          if (error) {
            return callback({
              ...error,
              errorMessage: 'Error while creating job',
            });
          }

          const interval = setInterval(() => {
            baseSdk[job.poll.controllerId][job.poll.operationId]({
              ...params,
              [job.poll.jobIdKey]: response.job_id,
            }, (err, pollResponse) => {
              const fail = err
                        || pollResponse.job_status === 'FAILED'
                        || pollResponse.job_status === 'DONE' && isUndefined(pollResponse.results);
              if (fail) {
                clearInterval(interval);
                return callback({
                  ...err,
                  errorMessage: 'Error while polling result',
                });
              }

              if (pollResponse.job_status === 'DONE') {
                clearInterval(interval);
                callback(null, pollResponse);
              }
            });
          }, pollInterval);
        },
        options,
      );
    };
  };
}
