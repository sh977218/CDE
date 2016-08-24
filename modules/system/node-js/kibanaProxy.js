var request = require('request');

exports.setUp = function(app) {
    app.use('/app/kibana/', function(req, res) {
        req.pipe(request('http://localhost:5601/app/kibana' + req.url)).on('error', function() {res.sendStatus(500);}).pipe(res);
    });
    app.use('/bundles', function(req, res) {
        req.pipe(request('http://localhost:5601/bundles' + req.url)).on('error', function() {res.sendStatus(500);}).pipe(res);
    });
    app.use('/elasticsearch/_mget', function(req, res) {
        req.pipe(request({
            url: 'http://localhost:5601/elasticsearch/_mget' + req.url.substr(1)
            , headers: {
                "kbn-version": "4.5.4"
            }
        })).on('error', function() {res.sendStatus(500);}).pipe(res);
    });
    app.use('/elasticsearch/.kibana/index-pattern/_search', function(req, res) {
        req.pipe(request({
            url: 'http://localhost:5601/elasticsearch/.kibana/index-pattern/_search' + req.url.substr(1)
            , headers: {
                "kbn-version": "4.5.4"
            }
        })).on('error', function() {res.sendStatus(500);}).pipe(res);
    });

    app.use('/elasticsearch/.kibana/_mapping/*/field/_source', function(req, res) {
        req.pipe(request({
            url: 'http://localhost:5601/elasticsearch/.kibana/_mapping/*/field/_source' + req.url.substr(1)
            , headers: {
                "kbn-version": "4.5.4"
            }
        })).on('error', function() {res.sendStatus(500);}).pipe(res);
    });
    app.use('/elasticsearch/_msearch', function(req, res) {
        req.pipe(request({
            url: 'http://localhost:5601/elasticsearch/_msearch' + req.url.substr(1)
            , headers: {
                "kbn-version": "4.5.4"
            }
        })).on('error', function() {res.sendStatus(500);}).pipe(res);
    });
};
