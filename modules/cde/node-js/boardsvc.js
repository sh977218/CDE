var mongo_data = require('./mongo-cde')
    , elasticsearch = require('elasticsearch')
    , config = require('../../system/node-js/parseConfig');

var client = new elasticsearch.Client({
    host: config.elasticBoardIndexUri
});

exports.boardSearch = function(req, res) {
    client.search({
       body: {
           query: {
               bool: {
                   must: [{
                       match: {shareStatus: 'Private'}
                       , match: {_all: req.body.q}
                   }]
               }
           }
       }
    }).then(function (body) {
        res.send(body);
    }, function (error) {
        throw error;
    });
};