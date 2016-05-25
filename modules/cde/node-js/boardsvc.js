var elasticsearch = require('elasticsearch')
    , config = require('../../system/node-js/parseConfig')
    ;

var client = new elasticsearch.Client({
    host: config.elasticBoardIndexUri
});

exports.boardSearch = function (req, res) {
    var query = {
        "body": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {"shareStatus": 'Public'}
                        },
                        {
                            "match": {"_all": req.body.q}
                        }
                    ]
                }
            },
            "aggs": {
                "aggregationsName": {
                    "terms": {
                        "field": "tags",
                        "size": 50
                    }
                }
            }
        }
    };
    if (req.body.tags) {
        req.body.tags.forEach(function (t) {
            if (t !== 'All')
                query.body.query.bool.must.push(
                    {
                        "term": {
                            "tags": {
                                value: t
                            }
                        }
                    })
        });
    }
    client.search(query).then(function (body) {
        res.send(body);
    }, function (error) {
        throw error;
    });
};