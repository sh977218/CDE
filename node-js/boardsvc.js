var mongo_data = require('./mongo-data');

exports.boardList = function(req, res) {
    var from = req.query["from"],
        pagesize = req.query["pagesize"],
        search = req.query["search"];
   
    if (!from) {
        from = 0;
    }
    if (!pagesize) {
        pagesize = 20;
    }
    if (search == 'undefined') {
        search = "";
    } 
    var searchObj = {};
    if (search) {
        searchObj = JSON.parse(search);
        searchObj.shareStatus = "Public";
        if (searchObj.name) {
            searchObj.name = new RegExp(searchObj.name, 'i');
        }
    }

    mongo_data.boardList(from, pagesize, searchObj, function(err, boardlist) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(boardlist);
       }
    });
};