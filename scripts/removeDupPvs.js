var mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async')
    ;


var idList = [];

var stream = mongo_cde.getStream({$where: "this.valueDomain.permissibleValues.length > 2",
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
    async.each(idList, function (id, oneDone) {
        mongo_cde.byId(id, function (err, cde) {
            console.log("+");
            var pvSet = new Set(cde.valueDomain.permissibleValues.map(
                pv => pv.permissibleValue + "--" + pv.valueMeaningName));
            if (pvSet.size !== cde.valueDomain.permissibleValues.length) {
                console.log("found dup: " + cde.tinyId);
                i++;
            }
            oneDone();
        });
    }, function (err) {
        console.log("All Done");
        console.log(i);
        process.exit(0);
    })
});


