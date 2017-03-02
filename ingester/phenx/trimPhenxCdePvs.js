var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;
var deCount = 0;
var cond = {'classification.stewardOrg.name': 'PhenX', archived: null};
DataElement.find(cond).exec((err, cdes)=> {
    async.forEach(cdes, (cde, doneOneCde)=> {
        if (cde.valueDomain.datatype === 'Value List') {
            cde.valueDomain.permissibleValues.forEach((p)=> {
                p.permissibleValue = p.permissibleValue.trim();
            });
            cde.save(()=> {
                deCount++;
                console.log('deCount: ' + deCount);
                doneOneCde();
            })
        } else {
            doneOneCde();
        }
    }, ()=> {
        console.log('finished all');
        process.exit(1);
    })
});