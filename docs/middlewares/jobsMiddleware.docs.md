# [Jobs middleware](../../src/middlewares/jobsMiddleware.js)

Some operations like creating a csv export need to be done asynchronously because they can take more time than common timeouts can accept. Asynchronous operations need to be start by calling their create endpoint and then keeping calling the poll endpoint till the operation is finished.

For instance, to create a csv, you need to call createUrlsExport that returns a job id. Then poll getUrlsExportStatus every X seconds with that job id till the response indicate that the job is done.

This middleware abstract this logic in a way that you just have to call the create job operation, meanwhile the milddleware will poll the API and returns the response when finished.


## Middleware requirement
- **jobs:** List of jobs to work on.
- **pollInterval:** Number of milliseconds between each poll.

## Operation options
none

## Usage
``` JS
import { applyMiddleware, jobsMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  jobsMiddleware()
)(baseSdk);

AnalysisController.createUrlsExport({
  username,
  projectSlug,
  analysisSlug,
  urlsQuery,
  area,
}, (err, result) => {
  if (err) {
    //Handle Error
  }
  window.location = result.download_url;
});
```


## Without the middleware
``` JS

AnalysisController.createUrlsExport({
  username,
  projectSlug,
  analysisSlug,
  urlsQuery,
  area,
}, (err, response) => {
  if (err) {
    //Handle creating error
    return;
  }

  const interval = setInterval(() => {
    AnalysisController.getUrlsExportStatus({
      ...params
      urlExportId: response.job_id,
    }, (err, pollResponse) => {
      const fail = err
                || pollResponse.job_status === 'FAILED'
                || pollResponse.job_status === 'DONE' && isUndefined(pollResponse.results);
      if (fail) {
        clearInterval(interval);
        //Handle poll error
        return;
      }

      if (pollResponse.job_status === 'DONE') {
        // Success
        clearInterval(interval);
        window.location = result.download_url;
      }
    });
  }, 5000);
});
```
