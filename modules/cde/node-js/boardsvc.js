var mongo_data = require('./mongo-cde')
    , elasticsearch = require('elasticsearch')
    , config = require('../../system/node-js/parseConfig');

var client = new elasticsearch.Client({
    host: config.elasticBoardIndexUri
});

//exports.boardList = function(req, res) {
//    var from = req.query["from"],
//        pagesize = req.query["pagesize"],
//        search = req.query["search"];
//
//    if (!from) {
//        from = 0;
//    }
//    if (!pagesize) {
//        pagesize = 20;
//    }
//    if (search == 'undefined') {
//        search = "";
//    }
//    var searchObj = {};
//    if (search) {
//        searchObj = JSON.parse(search);
//        searchObj.shareStatus = "Public";
//        if (searchObj.name) {
//            searchObj.name = new RegExp(searchObj.name, 'i');
//        }
//    }
//
//    mongo_data.boardList(from, pagesize, searchObj, function(err, boardlist) {
//       if (err) {
//           res.send("ERROR");
//       } else {
//           res.send(boardlist);
//       }
//    });
//};

exports.boardSearch = function(req, res) {
    client.search({
        q: req.body.q
    }).then(function (body) {
        res.send(body);
    }, function (error) {
        throw error;
    });
};