var elasticsearch = require('elasticsearch')
    , config = require('../../system/node-js/parseConfig')
    ;

var client = new elasticsearch.Client({
    host: config.elastic.hosts
});

exports.boardSearch = function(req, res) {
    client.search({
       body: {
           query: {
               bool: {
                   must: [{
                       match: {shareStatus: 'Public'}
                   }, {
                       match: {_all: req.body.q}
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