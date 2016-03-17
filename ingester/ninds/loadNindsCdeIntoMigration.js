var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    FormModel = require('./createConnection').FormModel

    ;
function createCde(cde, ninds) {
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
    var nindsVariableAliasId = {
        source: 'NINDS Variable Name Alias',
        id: cde.aliasesForVariableName,
        version: cde.versionNum
    };
    ids.push(nindsId);
    ids.push(caDSRId);
    ids.push(nindsVariableId);

    var instruction = {Disease: ninds.diseaseName, instruction: {value: cde.instruction}};
    var instructions = [];
    instructions.push(instruction);

    var property = {key: 'NINDS Previous Title', value: cde.previousTitle};
    var properties = [];
    properties.push(property);

    var referenceDocument = {};
    referenceDocument = {
        title: cde.reference,
        uri: cde.reference.indexOf('http://www.') != -1 ? cde.reference : ''
    };
    var referenceDocuments = [];
    if (referenceDocument.title != 'No references available') {
        referenceDocuments.push(referenceDocument);
    }

    var pvsArray = cde.permissibleValue.split(';');
    var pdsArray = cde.permissibleDescription.split(';');
    if (pvsArray.length != pdsArray.length) {
        console.log('permissibleValue and permisslbeDescription do not match.' + ' form id: ' + form.id + 'cde id: ' + cde.cdeId);
        process.exit(1);
    }
    var permissibleValues = [];
    for (var i = 0; i < pvsArray.length; i++) {
        var permissibleValue = {
            permissibleValue: pvsArray[i],
            valueMeaningName: pvsArray[i],
            valueMeaningDefinition: pdsArray[i]
        };
        if (permissibleValue.permissibleValue.length > 0)
            permissibleValues.push(permissibleValue);
    }
    var dataType;
    if (cde.dataType === 'Alphanumeric') {

    } else if (cde.dataType === 'Alphanumeric') {

    } else {

    }
    var valueDomain = {
        uom: cde.measurementType
    };


    var newCde = {
        naming: naming,
        referenceDocuments: referenceDocuments,
        ids: ids,
        instructions: instructions,
        properties: properties,
        valueDomain: valueDomain
    };
    return newCde;
}
function a(cb) {
    var stream = NindsModel.find({}).stream();
    stream.on('data', function (ninds) {
        stream.pause();
        if (ninds && ninds.get('cdes').length > 0) {
            async.forEachSeries(ninds.get('cdes'), function (cde, doneOneCde) {
                var newCde = createCde(cde, ninds);
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