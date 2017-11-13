var cdash = require('./cdash1-1'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require('async'),
    classificationShared = require('@std/esm')(module)('../modules/system/shared/classificationShared')
    ;

var cdashOrg;
var toSave = [];

function doCdes() {

    var newForm;

    cdash.forEach(function (cdashRow) {
        var formName = cdashRow.Domain;
        if (cdashRow.Role) {
            cdashRow = cdashRow + " - " + cdashRow.Role;
        }

        if (!newForm || newForm.naming[0].designation !== formName) {
            newForm = {};
            newForm.naming = [{
                designation: formName,
                definition: "",
                context: {contextName: "Health"},
                classification: {sterwardOrg: "CDASH", elements: [{name: "Forms", elements: []}]},
                formElements: []
            }];
            toSave.push(newForm);
        }

        var cde = {
            naming: [
                {
                    designation: cdashRow['Question Text'],
                    definition: cdashRow['Definition'],
                    context: {contextName: "Health"}
                }
            ],
            ids: [
                {
                    source: "CDASH Variable Name",
                    id: cdashRow['SDTM or CDASH Variable Name'],
                    version: ""
                }
            ],
            mappingSpecifications: [
                {
                    content: "BRIDG",
                    spec_type: "BRIDG",
                    script: cdashRow['BRIDG']
                }
            ],
            properties: [
                {
                    key: "CDASH Information for Sponsors",
                    value: cdashRow['Information for Sponsors']
                }
            ],
            valueDomain: {}
        };

        switch (cdashRow['Data Type']) {
            case 'Char':
                cde.valueDomain.datatype = 'Text';
                break;
            case 'Num':
                cde.valueDomain.datatype = 'Number';
                break;
            case 'Date (dd-MON-yyyy)':
                cde.valueDomain.datatype = 'Date';
                cde.valueDomain.datatypeDate = {format: 'dd-MON-yyyy'};
                break;
            case 'Time (24 Hour)':
                cde.valueDomain.datatype = 'Time';
                cde.valueDomain.datatypeTime = {format: '24 hour'};
                break;
            default:
                cde.valueDomain.datatype = 'Value List';
        }

        var cls = [cdashRow['Domain']];
        if (cdashRow['Role'].length > 0) {
            cls.push(cdashRow['Role']);
        }
        classificationShared.classifyItem(cde, "CDASH", cls);
        classificationShared.addCategory({elements: cdashOrg.classifications}, cls);

        var cls2 = ["Classification", cdashRow['Core']];
        classificationShared.classifyItem(cde, "CDASH", cls2);
        classificationShared.addCategory({elements: cdashOrg.classifications}, cls2);

        var question = {
            elementType: "question",
            label: cde.naming[0].designation
        };

        if (cdashRow['CRF Completion Instructions'].toLowerCase().indexOf("not application") !== 0) {
            question.instructions = cdashRow['CRF Completion Instructions'];
        }

        newForm.formElements.push(question);

    });
    toSave.async(
        function (objToSave, cb) {
            objToSave.save(function (err) {
                if (err) throw err;
                cb();
            })
        }
        , function (err) {
            if (err) throw err;
            console.log("All done, saving org");
            process.exit(0);
        }
    );
}

mongo_data_system.findOrCreateOrg(
    {name: "CDASH", classifications: {name: "Forms", elements: []}}
    , function (err, org) {
        if (err) throw err;
        cdashOrg = org;
        toSave.push(cdashOrg);
        doCdes();
    });

