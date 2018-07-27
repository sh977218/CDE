const boardDb = require('../server/board/boardDb');

function doStream(dao) {
    let i = 0;
    let stream = boardDb.getStream({});
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

doStream(boardDb);