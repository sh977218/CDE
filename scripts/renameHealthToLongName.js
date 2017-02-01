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


});