import lscache from 'ls-cache';
import objectHash from 'object-hash';


const ANALYSES_CONTROLLER_ID = 'AnalysisController';
const GET_ANALYSIS_OPERATION_ID = 'getAnalysisSummary';
const DATE_LAST_MODIFIED_KEY = 'date_last_modified';

const LSCACHE_EXPIRATION_MIN = 60 * 24 * 365; // In Minutes
const INVALIDATE_ANALYSIS_BUCKET_ID = 'botifySdk-invalAna';
export const invalidateAnalysisBucket = lscache.createBucket(INVALIDATE_ANALYSIS_BUCKET_ID);

export function getAnalysisBucketId({ username, projectSlug, analysisSlug }) {
  return objectHash({username, projectSlug, analysisSlug });
}

/**
 * Update analysis date modified and flush analysis data if changed.
 * @param  {String} options.username
 * @param  {String} options.projectSlug
 * @param  {String} options.analysisSlug
 * @return {String}
 */
function flushIfAnalysisDateLastModifiedChanged({ username, projectSlug, analysisSlug }, dateLastModified) {
  const analysisBucketId = getAnalysisBucketId({ username, projectSlug, analysisSlug });
  const analysisBucket = lscache.createBucket(analysisBucketId);
  const previousDateLastModified = invalidateAnalysisBucket.get(analysisBucketId);

  if (previousDateLastModified !== dateLastModified) {
    // Flush Bucket
    analysisBucket.flushRecursive();
    try {
      // Store date Last Modified of analysis
      invalidateAnalysisBucket.set(analysisBucketId, dateLastModified, LSCACHE_EXPIRATION_MIN);
    } catch (e) {
      // If we get an error while setting the entry, flush the bucket
      invalidateAnalysisBucket.keys().forEach(key => {
        invalidateAnalysisBucket.remove(key);
      });
    }
  }
}

export default function invalidateAnalysisMiddleware({controllerId, operationId}) {
  return next => function(params, callback, options) {
    if (controllerId !== ANALYSES_CONTROLLER_ID) {
      return next(...arguments);
    }

    next(
      params,
      function(error, result) {
        if (operationId === GET_ANALYSIS_OPERATION_ID && !error) {
          const date = result[DATE_LAST_MODIFIED_KEY];
          flushIfAnalysisDateLastModifiedChanged(params, date);
        }
        callback(...arguments);
      },
      {
        ...options,
        bucketId: getAnalysisBucketId(params),
      }
    );
  };
}
