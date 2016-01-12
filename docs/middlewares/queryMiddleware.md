# [Query middleware](../../src/middlewares/queryMiddleware.js)

This middleware makes it easy to use the operation `getUrlsAggs` which allows you to perform complex queries on Botify database.

Indeed, it enables you to use the [Query](../../src/models/Query.js) class to define aggregations you want to perform. Plus, it can optionaly transform the response to make it easier to process (transformations can be configured).

## Middleware requirement
none

## Middleware options
- **processResponse:** Enable response post processing. If true, every `urlsAggsQueries` must be instance of `Query`.
- **transformTermKeys:** Turn term keys into objects: key -> { value: key }
- **injectMetadata:** Inject metadata in groups keys

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


## Query Aggregate using Query Model

### Explanation

To define a query you have 2 ways, either using the `Query` class or using a JS plain Object. We will focus on the first way, the second is documented in the Botify Rest API documentation.

A `Query` is composed of `Filters` and a set of `QueryAggregate`.

A `QueryAggregate` can define some `metrics` to compute and a set of `group-bys`s to operate on:
- `group-by` is defined by:
  - `field` on which the group by is performed.
  - some optional `ranges` that define buckets for the group-by operation.
- `metric` defines the operation to compute. Available metrics are: `count`, `sum`, `avg`, `min`, `max`. Execpt for count, a field on which compute the sum for instance, must be provided. The default metric is `count`.

### Example

The following `Query` filters the dataset on compliant URLs and groups URLs by their HTTP code and their response time on 2 ranges (fast and slow URLs). We request the number of URLs and average response time for each group.

#### Request

```JS
import { models } from 'botify-sdk-middlewares';
const { Query, QueryAggregate } = models;

let query = new Query();
  .addAggregate(
    new QueryAggregate()
      .addGroupBy('http_code')
      .addRangeGroupBy('delay_last_byte', [
        {
          from: 0,
          to: 1000,
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

#### Response

The response could be the following. More details on the general Botify API documentation.

```JSON
[
  {
    "count": 25,
    "aggs": [
      {
        "groups": [
          {
            "key": [
              200,
              {
                "from": 0,
                "to": 1000
              }
            ],
            "metrics": [
              4,
              157.25
            ]
          },
          {
            "key": [
              200,
              {
                "from": 1000
              }
            ],
            "metrics": [
              19,
              1200.25
            ]
          },
          {
            "key": [
              201,
              {
                "from": 1000
              }
            ],
            "metrics": [
              2,
              1854.32
            ]
          }
        ]
      }
    ]
  }
]
```


## Advanced usage: response post processing

The middleware has a few options allowing to transform API result in order to make easier to perform on. It includes:
- Add metadata on both `term` and `range` group-bys.
- Turn `term` response groups keys into objects.
- Inject metadata into response groups keys.

The following explain the query aggregate request process from the query preparation to the result given by the SDK through the middleware request and response transformations. To do so, the same example is use from the beginning to the end.

### 1. `Query` preparation
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
          ]
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
          ]
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
          ]
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

```JS
{
  count: 37,
  aggs: [
    {
      groups: [
        {
          key: [
            {
              value: 200
            },
            {
              to: 500,
              from: 0,
              metadata: { label: 'Fast' }
            }
          ],
          metrics: [
            4,
            157.25
          ]
        },
        {
          key: [
            {
              value: 200
            },
            {
              to: 1000,
              from: 500,
              metadata: { label: 'Quite Slow' }
            }
          ],
          metrics: [
            28,
            751.25
          ]
        },
        {
          key: [
            {
              value: 301,
              metadata: { label: 'Redirections' }
            },
            {
              from: 1000
            }
          ],
          metrics: [
            5,
            1809.8
          ]
        }
      ]
    }
  ]
}
```
