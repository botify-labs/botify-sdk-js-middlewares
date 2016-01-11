# [Query middleware](../../src/middlewares/queryMiddleware.js)

This middleware makes it easy to use the operation `getUrlsAggs` which allows you to perform complex queries on Botify database (read paragraph *Query Aggregate Request Process* for details).

Indeed, it enables you to use the [Query](https://github.com/botify-labs/botify-sdk-middlewares/blob/master/src/models/Query.js) class to define aggregations you want to perform. Plus, it transforms the response to make it easier to process (transformations can be configured).

## Middleware requirement
- batchMiddleware (after)

## Middleware options
- {Boolean} transformTermKeys Turn term keys into objects: key -> { value: key }
- {Boolean} injectMetadata    Inject metadata in groups keys
- {Boolean} normalizeBoolean  Transform keys 'T' and 'F' to true and false

## Operation options
none

## Usage
```JS
import { applyMiddleware, queryMiddleware, batchMiddleware } from 'botify-sdk-middlewares';
import baseSdk from 'botify-sdk';

const sdk = applyMiddleware(
  queryMiddleware(),
  batchMiddleware()
)(baseSdk);

const params = {
  username: 'botify',
  projectSlug: 'botify.com',
  analyseSlug: 'foo',
};

sdk.AnalysesController.getQueryAggregate(
  {...params, queries: Array<Query>},
  (error, result) => {
    //Handle Result
  }
);
```

## Query Aggregate Request Process

The following explain the query aggregate request process from the query preparation to the result given by the SDK through the middleware request and response transformations. To do so, the same example is use from the beginning to the end.

### 1. Query Prepartion
To define a query you have to ways, either using the `Query` class or using a JS plain Object.

A `Query` is composed of `Filters` (see Filters documentation) and a set of `Aggregate`s.

An `Aggregate` can define some `metric` to compute and a set of `groupby`s to operate on:
- `groupby`: Can be either a `term` or `range` group by. A `groupby` is defined by:
  - `field` on which the group by is performed.
  - buckets (`terms` or `ranges`). It's possible to attach metadata for each bucket that will be injected into the response. Note: define `ranges` is a **mandatory** for `range groupby`.
- `metric`: define the operation to compute. Available metrics are: `count`, `sum`, `avg`, `min`, `max`. Execpt for count, a field on which compute the sum for instance, must be provided. The default metric is `count`.

#### 1.1. Using `Query` class
```JS
import { models } from 'botify-sdk-middlewares';
const { Query, QueryAggregate } = models;

let query = new Query();
.addAggregate(
  new QueryAggregate()
    .addTermGroupBy('http_code', [
      {
        value: 301,
        metadata: { label: 'Redirections' }
      },
      {
        value: 404,
        metadata: { label: 'Page Not Found' }
      }
    ])
    .addRangeGroupBy('delay_last_byte', [
      {
        from: 0,
        to: 500,
        metadata: { label: 'Fast' }
      },
      {
        from: 500,
        to: 1000,
        metadata: { label: 'Quite slow' }
      },
      {
        from: 1000,
      }
    ])
    .addMetric('count')
    .addMetric('avg', 'delay_last_byte')
)
.setFilters({
	field: 'strategic.is_strategic',
	predicate: 'eq',
	value: true
});
```

#### 1.2. Using a JS plain Object
```JS
{
  aggs: [
    {
      group_by: [
        {
          term: {
            field: 'http_code',
            terms: [
              {
                value: 301,
                metadata: { label: 'Redirections' }
              },
              {
                value: 404,
                metadata: { label: 'Page Not Found' }
              }
            ]
          }
        },
        {
          range: {
            field: 'delay_last_byte',
            ranges: [
              {
                from: 0,
                to: 500,
                metadata: { label: 'Fast' }
              },
              {
                from: 500,
                to: 1000,
                metadata: { label: 'Quite slow' }
              },
              {
                from: 1000,
              }
            ],
          }
        }
      ],
      metrics: [
        {
          count: null,
        },
        {
          avg: 'delay_last_byte'
        }
      ]
    }
  ],
  filters: {
  	field: 'strategic.is_strategic',
  	predicate: 'eq',
  	value: true
  }
}
```

### 2. Query Sent by the SDK to the API
```JSON
{
  "aggs": [
    {
      "group_by": [
        "http_code",
        {
          "range": {
            "field": "delay_last_byte",
            "ranges": [
              {
                "from": 0,
                "to": 500
              },
              {
                "from": 500,
                "to": 1000
              },
              {
                "from": 1000
              }
            ]
          }
        }
      ],
      "metrics": [
        "count",
        {
          "avg": "delay_last_byte"
        }
      ]
    }
  ],
  "filters": {
  	"field": "strategic.is_strategic",
  	"predicate": "eq",
  	"value": true
  }
}
```

#### 3. API Response
```JSON
{
  "count": 37,
  "aggs": [
    {
      "groups": [
        {
          "key": [
            200,
            {
              "to": 500,
              "from": 0
            }
          ],
          "metrics": [
            4,
            157.25
          ],
        },
        {
          "key": [
            200,
            {
              "to": 1000,
              "from": 500
            }
          ],
          "metrics": [
            28,
            751.25
          ],
        },
        {
          "key": [
            301,
            {
              "from": 1000
            }
          ],
          "metrics": [
            5,
            1809.8
          ],
        }
      ]
    }
  ]
}
```

### 4. Result given by the SDK
The sdk process the response by:
- turning `term` keys into objects
- injecting metadata (for both `term` and `range` keys)
- normalizing boolean keys: for boolean fields, the API returns `'T'` and `'F'` keys which are transform to `true` and `false`

```JS
{
  count: 37,
  aggs: [
    {
      groups: [
        {
          key: [
            {
              value: 200,
            }
            {
              to: 500,
              from: 0,
              metadata: { label: 'Fast' }
            }
          ],
          metrics: [
            4,
            157.25
          ],
        },
        {
          key: [
            {
              value: 200,
            }
            {
              to: 1000,
              from: 500,
              metadata: { label: 'Quite Slow' }
            }
          ],
          metrics: [
            28,
            751.25
          ],
        },
        {
          key: [
            {
              value: 301,
              metadata: { label: 'Redirections' }
            }
            {
              from: 1000
            }
          ],
          metrics: [
            5,
            1809.8
          ],
        }
      ]
    }
  ],
}
```
