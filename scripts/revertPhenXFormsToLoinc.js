let mongo_form = require('../modules/form/node-js/mongo-form');
let mongo_cde = require('../modules/cde/node-js/mongo-cde');
let adminItemSvc = require("../modules/system/node-js/adminItemSvc");
let classificationNode = require('../modules/system/node-js/classificationNode');
let classificationShared = require('@std/esm')(module)('../modules/system/shared/classificationShared.js');
let request = require('request');
let async = require('async');

let count = 0;

function classifyTinyidList(list, newClassif, cb) {

    let action = function(elt, actionCallback) {
        let classifReq = {
            orgName: newClassif.orgName
            , categories: newClassif.categories
            , tinyId: elt.id || elt
            , version: elt.version || null
        };
        classificationNode.eltClassification(classifReq, classificationShared.actions.create, mongo_cde, actionCallback);
    };

    adminItemSvc.bulkAction(list, action, cb);
}

function pushToCategories(elt, categories) {
    categories.push(elt.name);
    if (elt.elements[0]) {
        return pushToCategories(elt.elements[0], categories);
    }
}


mongo_form.Form.find({"classification.stewardOrg.name": "PhenX", archived: false,
        "registrationState.registrationStatus": {$ne: "Qualified"}},
    (err, phenxForms) => {
     console.log("phenxForms: " + phenxForms.length);

     async.eachSeries(phenxForms, (pForm, oneDone) => {
        let foundArchived = false;
        async.eachSeries(pForm.history, (hId, oneHistDone) => {
            if (!foundArchived) {
                mongo_form.byId(hId, (err, hForm) => {
                    hForm.ids.forEach(id => {
                        if (id.source === 'LOINC') {
                            foundArchived = true;

                            pForm.changeNote = "Revert to Loinc CDEs";
                            pForm.ids.push(id);
                            pForm.formElements =
                                {
                                    elementType: "section",
                                    label: "",
                                    formElements: hForm.formElements,
                                    instructions: {
                                        value: ""
                                    }
                                };

                            let ids = [];
                            let getChildren = function (element) {
                                if (element.elementType === 'section') {
                                    element.formElements.forEach(function (e) {
                                        getChildren(e);
                                    });
                                } else if (element.elementType === 'question') {
                                    ids.push({
                                        id: element.question.cde.tinyId,
                                        version: element.question.cde.version
                                    });
                                }
                            };
                            pForm.formElements.forEach(function (e) {
                                getChildren(e);
                            });

                            console.log("IDS: " + ids.map(id => id.id));

                            let categories = [];
                            pushToCategories(pForm.classification[0].elements[0], categories);
                            classifyTinyidList(ids, {orgName: pForm.classification[0].stewardOrg.name, categories: categories}, function () {
                                console.log("CDEs classified - " + pForm.classification[0].stewardOrg.name + "---" + categories);
                                mongo_form.update(pForm, "batchloader", (err, newForm) => {
                                    newForm.sources.push({
                                        sourceName: "LOINC",
                                        copyright: {
                                            valueFormat: "html",
                                            value: "<a href='http://loinc.org/terms-of-use' target='_blank'>Terms of Use</a>"
                                        }
                                    });
                                    newForm.save((err) => {
                                        if (err) console.log("ERRROR: " + err) ;
                                        else console.log(newForm.tinyId + " done " + count++);
                                        oneHistDone();
                                    });
                                })
                            });

                        }
                    });
                    if (!foundArchived) {
                        oneHistDone();
                    }
                });
            } else {
                oneHistDone();
            }
        }, oneDone);
     }, () => {
         console.log("Finished");
         process.exit(0);
     });
});
