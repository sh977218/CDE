var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    FormModel = require('./createConnection').FormModel

    ;
function createCde(cde, form) {
    var naming = [];
    var name1 = {designation: cde.cdeName, definition: cde.definitionDescription};
    var name2 = {
        designation: cde.questionText,
        context: {
            contextName: 'Question Text'
        }
    };
    naming.push(name1);
    naming.push(name2);


    var ids = [];
    var nindsId = {source: 'NINDS', id: cde.cdeId, version: cde.versionNum};
    var caDSRId = {source: 'caDSR', id: cde.cadsrId, version: cde.versionNum};
    var nindsVariableId = {source: 'NINDS Variable Name', id: cde.varibleName, version: cde.versionNum};
    ids.push(nindsId);
    ids.push(caDSRId);
    ids.push(nindsVariableId);

    var instruction = {Disease: form.diseaseName, instruction: {value: cde.instruction}};
    var instructions = [];
    instructions.push(instruction);


    var newCde = {};
    newCde
    return newCde;
}
function a(cb) {
    var stream = NindsModel.find({}).stream();
    stream.on('data', function (data) {
        stream.pause();
        if (data && data.get('cdes').length > 0) {
            async.forEachSeries(data.get('cdes'), function (cde, doneOneCde) {
                var newCde = createCde(cde, data);
            }, function doneAllCdes() {
                stream.resume();
            })
        } else {
            stream.resume();
        }
    });

    stream.on('end', function (err) {
        if (err) throw err;
        cb();
    });
}

a();