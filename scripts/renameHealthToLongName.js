var mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async')
    ;

var idList = [];

var stream = mongo_cde.getStream({
    archived: null,
    retired: {$ne: 'Retired'},
    source: 'caDSR'
});

stream.on('data', function (cde) {
    idList.push(cde._id);
    console.log(idList.length);
});

var i = 0;
stream.on('close', function () {
    console.log(idList.length + " todo");
    async.eachSeries(idList, function (id, oneDone) {
        mongo_cde.byId(id, function (err, cde) {

            cde.naming.forEach(function (n) {
                if (n.tags) {
                    n.tags.forEach(function (t) {
                        if (t.tag === 'Health') t.tag = "Long Name";
                    });
                }
            });

            cde.changeNote = "Modified Tag from Health to Long Name";

            mongo_cde.update(cde, {username: "batchloader"}, function (err) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                console.log("updated: " + cde.tinyId + "  " + i / idList.length + " %");
                oneDone();
                i++;
            });
        });
    }, function (err) {
        console.log("All Done");
        console.log(i);
        process.exit(0);
    });

});