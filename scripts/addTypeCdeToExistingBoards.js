var mongo_board = require('../modules/board/node-js/mongo-board'),
    async = require('async')
    ;


function doStream(dao) {
    var i = 0;
    var stream = mongo_board.getStream({});
    stream.on('data', function (elt) {
        console.log(i++);
        stream.pause();
        elt.type = 'cde';
        elt.markModified('type');
        elt.save(function (e) {
            if (e) throw e;
            stream.resume();
        })
    });
    stream.on('end', function () {
        console.log(dao.type + " Done");
        process.exit(1);
    })
}

doStream(mongo_board);