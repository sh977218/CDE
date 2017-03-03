var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;
var totalDeCount = 0;
var modifiedDeCount = 0;
var cond = {'classification.stewardOrg.name': 'PhenX', archived: null};
DataElement.find(cond).exec((err, cdes)=> {
    async.forEach(cdes, (cde, doneOneCde)=> {
        totalDeCount++;
        if (cde.valueDomain.datatype === 'Value List') {
            if (!cde.valueDomain.permissibleValues || cde.valueDomain.permissibleValues.length === 0) {
                console.log('cde is value list with no pvs. tinyId:' + cde.tinyId);
                process.exit(1);
            }
            cde.valueDomain.permissibleValues.forEach((p)=> {
                p.permissibleValue = p.permissibleValue.trim();
            });
            cde.save(()=> {
                modifiedDeCount++;
                console.log('modifiedDeCount: ' + modifiedDeCount);
                doneOneCde();
            })
        } else {
            doneOneCde();
        }
    }, ()=> {
        console.log('finished all');
        console.log('totalDeCount: ' + totalDeCount);
        process.exit(1);
    })
});