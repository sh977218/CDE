var mongo_form = require('../modules/form/node-js/mongo-form'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../modules/system/node-js/mongo-data'),
    async = require('async')
    ;


function doStream(dao) {
    var i = 0;
    var stream = mongo_cde.getStream({"comments.0": {$exists: true}});
    stream.on('data', function (elt) {
        console.log(i++);
        stream.pause();
        async.each(elt.comments, function (c, oneDone) {
            c.element = {
                eltType: "cde",
                eltId: elt.tinyId
            };
            mongo_data.Comments.update({_id: c._id}, c, {upsert: true}, function (err) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                oneDone();
            });
        }, function allDone() {
            stream.resume();
        });
    });
    stream.on('end', function () {
        console.log(dao.type +  " Done")
    })
}

doStream(mongo_cde);
doStream(mongo_form);