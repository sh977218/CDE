import { eachSeries } from 'async';
import { actions } from 'shared/system/classificationShared';
import { eltClassification } from '../server/classification/classificationNode';
import * as mongo_cde from '../server/cde/mongo-cde';
import { byId, update, Form } from '../server/form/mongo-form';
import { bulkAction } from "../server/system/adminItemSvc";

let count = 0;

function classifyTinyidList(list, newClassif, cb) {

    let action = function(elt, actionCallback) {
        let classifReq = {
            orgName: newClassif.orgName
            , categories: newClassif.categories
            , tinyId: elt.id || elt
            , version: elt.version || null
        };
        eltClassification(classifReq, actions.create, mongo_cde, actionCallback);
    };

    bulkAction(list, action, cb);
}

function pushToCategories(elt, categories) {
    categories.push(elt.name);
    if (elt.elements[0]) {
        return pushToCategories(elt.elements[0], categories);
    }
}

Form.find({"classification.stewardOrg.name": "PhenX", archived: false,
        "registrationState.registrationStatus": {$ne: "Qualified"}},
    (err, phenxForms) => {
     console.log("phenxForms: " + phenxForms.length);

     eachSeries(phenxForms, (pForm: any, oneDone) => {
        let foundArchived = false;
        eachSeries(pForm.history, (hId, oneHistDone) => {
            if (!foundArchived) {
                byId(hId, (err, hForm) => {
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
                                update(pForm, "batchloader", (err, newForm) => {
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
