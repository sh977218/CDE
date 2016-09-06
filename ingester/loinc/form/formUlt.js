var REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
var MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;

var DataElementModel = require('../../createNlmcdeConnection').DataElementModel;
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;

var CreateElt = require('../Shared/CreateElt');

exports.createForm = function (loinc, org, orgInfo, cb) {
    CreateElt.createElt(loinc, org, orgInfo, function (newForm) {
        newForm.formElements = [{
            elementType: 'section',
            formElements: []
        }];
        cb(newForm);
    });
};



exports.loadCde=function(element, fe, next) {
    DataElementModel.find({
        archived: null,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: 'LOINC', id: element['LOINC#']}).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('cannot find this cde with loincId: ' + element['LOINC#']);
            console.log('formId: ' + form.ids[0].id);
            process.exit(1);
        } else {
            var existingCde = existingCdes[0];
            var question = {
                instructions: {value: ''},
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.naming[0].designation,
                    version: existingCde.version,
                    permissibleValues: existingCde.valueDomain.permissibleValues,
                    ids: existingCde.ids
                },
                required: REQUIRED_MAP[element['ANSWER CARDINALITY']],
                multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
                datatype: existingCde.valueDomain.datatype,
                datatypeNumber: existingCde.valueDomain.datatypeNumber,
                datatypeText: existingCde.valueDomain.datatypeText,
                answers: existingCde.valueDomain.permissibleValues,
                uoms: []
            };
            if (element['Ex UCUM Units']) {
                question.uoms.push(element['Ex UCUM Units']);
            }
            var formElement = {
                elementType: 'question',
                instructions: {},
                label: existingCde.naming[0].designation,
                question: question,
                formElements: []
            };

            existingCde.naming.forEach(function (n) {
                if (n.context.contextName === "TERM DEFINITION/DESCRIPTION(S)") {
                    formElement.instructions.value = n.definition;
                }
            });
            fe.push(formElement);
            next();
        }
    });
};

exports.saveObj = function(form,count,next){
    var loincId;
    form.ids.forEach(function(i){
        if(i.source==='LOINC') loincId = i.id;
    });
    MigrationFormModel.find({'ids.id':loincId}).exec(function(er,existingForms){
        if(er) throw er;
        if(existingForms.length ===0){
            var obj  = new MigrationFormModel(form);
            obj.save(function(err,o){
                if(err) throw err;
                count++;
                console.log('count:'+count);
                next(o);
            })
        }else{
            next();
        }
    });
};