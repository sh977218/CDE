var async = require('async'),
    NindsModel = require('./createConnection').NindsModel,
    DataElementModel = require('./createConnection').DataElementModel,
    FormModel = require('./createConnection').FormModel
    ;

var cdeCounter = 0;

function transferCde(existingCde, newCde) {
    var existingNaming = existingCde.get('naming');
    var existCdeName, existQuestionText;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation === newCde.cdeName)
            existCdeName = true;
        if (existingName.designation === newCde.questionText)
            existQuestionText = true;
    });
    if (existCdeName) {
        var newCdeName = {designation: newCde.cdeName, definition: newCde.definitionDescription};
        existingNaming.push(newCdeName);
    }
    if (existQuestionText) {
        var newQuestionText = {
            designation: newCde.questionText,
            context: {
                contextName: 'Question Text'
            }
        };
        existingNaming.push(newQuestionText);
    }

    var existingIds = existingCde.get('ids');
    var existCaDSRId, existNindsVariableId, existNindsVariableAliasId;
    existingIds.forEach(function (existingId) {
        if (existingId.source === 'caDSR' && existingId.id === newCde.cadsrId)
            existCaDSRId = true;
        if (existingId.source === 'NINDS Variable Name' && existingId.id === newCde.nindsVariableId)
            existNindsVariableId = true;
        if (existingId.source === 'NINDS Variable Name Alias' && existingId.id === newCde.nindsVariableAliasId)
            existNindsVariableAliasId = true;
    });
    if (existCaDSRId) {
        var newCaDSRId = {source: 'caDSR', id: newCde.cadsrId, version: newCde.versionNum};
        existingNaming.push(newCdeName);
    }
    if (existNindsVariableId) {
        var newNindsVariableId = {source: 'NINDS Variable Name', id: newCde.varibleName, version: newCde.versionNum};
        existingNaming.push(newCdeName);
    }
    if (existNindsVariableAliasId) {
        var newNindsVariableAliasId = {
            source: 'NINDS Variable Name Alias',
            id: newCde.aliasesForVariableName,
            version: newCde.versionNum
        };
        existingNaming.push(newCdeName);
    }


};

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

    var property1 = {key: 'NINDS Previous Title', value: cde.previousTitle};
    var property2 = {key: 'NINDS Guidelines', value: cde.crfModuleGuideline};
    var properties = [];
    properties.push(property1);
    properties.push(property2);

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
        console.log('*******************permissibleValue and permisslbeDescription do not match.');
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
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
    var valueDomain = {
        uom: cde.measurementType
    };
    if (cde.dataType === 'Alphanumeric') {
        if (cde.inputRestrictions === 'Free-Form Entry') {
            var datatypeText = {maxLength: cde.size};
            valueDomain.datatypeText = datatypeText;
            valueDomain.datatype = 'Text';
        } else if (cde.inputRestrictions === 'Single Pre-Defined Value Selected' || cde.inputRestrictions === 'Multiple Pre-Defined Values Selected') {
            valueDomain.permissibleValues = permissibleValues;
            valueDomain.datatype = 'Value List';
        } else {
            console.log('unknown cde.inputRestrictions found:' + cde.inputRestritions);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }
    }
    else if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
        var datatypeNumber = {minValue: cde.minValue, maxValue: cde.maxValue};
        valueDomain.datatypeNumber = datatypeNumber;
        valueDomain.datatype = 'Number';
    } else if (cde.dataType === 'Date or Date & Time') {
        valueDomain.datatype = 'Date';
    } else {
        console.log('unknown cde.dataType found:' + cde.dataType);
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        process.exit(1);
    }

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
                DataElementModel.findOne({'ids.id': cde.cdeId}, function (err, existingCde) {
                    if (err) throw err;
                    if (existingCde) {
                        transferCde(existingCde, cde);
                    } else {
                        var newCde = createCde(cde, ninds);
                        var newCdeObj = new DataElementModel(newCde);
                        newCdeObj.save(function () {
                            cdeCounter++;
                            doneOneCde();
                        });
                    }
                })
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