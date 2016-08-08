var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');

var wrongOrgName = 'EyeGene';
var orgName = 'eyeGENE';
var deCount = 0;
var stream = mongo_cde.getStream({
    'classification.stewardOrg.name': wrongOrgName
});
stream.on('data', function (doc) {
    stream.pause();
    doc.stewardOrg.name = orgName;
    if (doc.valueDomain.datatype === 'Value List') {
        doc.valueDomain.permissibleValues.forEach(function (pv) {
            pv.codeSystemName = 'LOINC';
        })
    }
    doc.save(function (err) {
        if (err) throw err;
        else {
            deCount++;
            console.log('deCount:' + deCount);
            stream.resume();
        }
    });
});
stream.on('error', function (err) {
    throw err;
});
stream.on('end', function () {
    console.log('finished');
    process.exit(1);
});