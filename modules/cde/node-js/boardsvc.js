var mongo_data = require('./mongo-cde')
    , elasticsearch = require('elasticsearch')
    , config = require('../../system/node-js/parseConfig');

var client = new elasticsearch.Client({
    host: config.elasticBoardIndexUri
});

exports.boardSearch = function(req, res) {
    client.search({
        q: req.body.q
        , size: 100
    }).then(function (body) {
        res.send(body);
    }, function (error) {
        throw error;
    });
};