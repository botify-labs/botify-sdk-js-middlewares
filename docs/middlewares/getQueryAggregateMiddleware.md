# getQueryAggregate middleware

## API Query
{
  "aggs": [
    {
      "group_by": [
        {
          "terms": {
            "field": "http_code",
            "metadata": {}
          }
        }
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
                "from": 1000,
                "to": 2000
              },
              {
                "from": 2000
              }
            ],
            "metadata": {}
          }
        }
      ],
      "metrics": [
        {
          "count": "url"
        },
        {
          "avg": "delay_last_byte"
        }
      ]
    }
  ],
  "fields": {
  	"field": "strategic.is_strategic",
  	"predicate": "eq",
  	"value": true
  }
}

## Sent Query
```JSON
{
  "aggs": [
    {
      "group_by": [
        "host",
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
                "from": 1000,
                "to": 2000
              },
              {
                "from": 2000
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
  "fields": {
  	"field": "compliant.is_compliant",
  	"predicate": "eq",
  	"value": true
  }
}
```
