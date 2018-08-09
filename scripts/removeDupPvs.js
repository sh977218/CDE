var mongo_cde = require('../server/cde/mongo-cde'),
    async = require('async')
    ;

var idList = [];

var stream = mongo_cde.getStream({$where: "this.valueDomain.permissibleValues.length > 2",
    archived: false,
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
            var pvSet = new Set(cde.valueDomain.permissibleValues.map(
                pv => pv.permissibleValue + "--" + pv.valueMeaningName));
            if (pvSet.size !== cde.valueDomain.permissibleValues.length) {
                var ex = [];
                console.log("found dup: " + cde.tinyId);
                cde.valueDomain.permissibleValues = cde.valueDomain.permissibleValues.filter(pv => {
                    if (ex.indexOf(pv.permissibleValue + "--" + pv.valueMeaningName) > -1) return false;
                    else {
                        ex.push(pv.permissibleValue + "--" + pv.valueMeaningName);
                        return true;
                    }
                });
                cde.markModified('valueDomain.permissibleValues');
                cde.changeNote = "Removed duplicate PV";
                mongo_cde.update(cde, {username: "batchloader"}, function (err) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }
                    console.log("updated: " + cde.tinyId);
                    oneDone();
                    i++;
                });
            } else {
                oneDone();
            }
        });
    }, function (err) {
        console.log("All Done");
        console.log(i);
        process.exit(0);
    })
});


