# getQueryAggregate middleware

## Define a Query
To define a query you have to ways, either using the `Query` class or using a JS plain Object.

A `Query` is composed of `Filters` (see Filters documentation) and a set of `Aggregate`s.

An `Aggregate` can define some `metric` to compute and a set of `groupby`s to operate on:
- `groupby`: Can be either a `term` or `range` group by. A `groupby` is defined by:
  - `field` on which the group by is performed.
  - buckets (`terms` or `ranges`). It's possible to attach metadata for each bucket that will be injected into the response. Note: define `ranges` is a **mandatory** for `range groupby`.
- `metric`: define the operation to compute. Available metrics are: `count`, `sum`, `avg`, `min`, `max`. Execpt for count, a field on which compute the sum for instance, must be provided. The default metric is `count`.

### 1. Using `Query` class
```JS
import { models } from 'botify-sdk-middlewares';
const { Query, QueryAggregate } = models;

let query = new Query();
.addAggregate(
  new QueryAggregate()
    .addTermGroupBy('http_code', [
      {
        key: 301,
        metadata: { label: 'Redirections' }
      },
      {
        key: 404,
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

### 2. Using a JS plain Object
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
                key: 301,
                metadata: { label: 'Redirections' }
              },
              {
                key: 404,
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

## Query Sent by the SDK to the API
Corresponding request (to previous examples):
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
  	"field": "compliant.is_compliant",
  	"predicate": "eq",
  	"value": true
  }
}
```
