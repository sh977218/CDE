let validator = require('xsd-schema-validator');
let builder = require('xmlbuilder');
let dbLogger = require('../../system/node-js/dbLogger.js');

function addQuestion(parent, question) {
    let newQuestion = {
        "@ID": question.question.cde.tinyId
    };
    if (question.label !== undefined && !question.hideLabel) {
        newQuestion["@title"] = question.label;
    }
    if (question.instructions) {
        newQuestion.OtherText = {"@val": question.instructions.value ? question.instructions.value : ""};
    }
    let questionEle = parent.ele({Question: newQuestion});
    if (question.question.cde.ids.length > 0) {
        question.question.cde.ids.forEach(function (id) {
            let codedValueEle = questionEle.ele({
                CodedValue: {
                    "Code": {"@val": id.id},
                    "CodeSystem": {
                        "CodeSystemName": {"@val": id.source}
                    }
                }
            });
            if (id.version)
                codedValueEle.children.filter(c => c.name === 'CodeSystem')[0].ele({Version: {"@val": id.version}});
        });
    }

    if (question.question.datatype === 'Value List' && question.question.answers.length > 0) {
        let newListField = questionEle.ele("ListField");
        let newList = newListField.ele("List");
        if (question.question.multiselect) newListField.att("maxSelections", "0");

        if (question.question.answers) {
            question.question.answers.forEach(function (answer) {
                let title = answer.valueMeaningName ? answer.valueMeaningName : answer.permissibleValue;
                let q = {
                    "@ID": "NA_" + Math.random(),
                    "@title": title
                };
                if (answer.codeSystemName) {
                    q["CodedValue"] = {
                        "Code": {"@val": answer.valueMeaningCode},
                        "CodeSystem": {
                            "CodeSystemName": {"@val": answer.codeSystemName}
                        }
                    };
                }
                newList.ele({ListItem: q});
            });
        }
    } else {
        questionEle.ele("ResponseField").ele("Response").ele("string", {
            "name": "NA_" + Math.random(),
            "maxLength": "4000"
        });
    }
    idToName[question.question.cde.tinyId] = question.label;
    questionsInSection[question.label] = questionEle;
}

function doQuestion(parent, question) {

    let embed = false;
    try {
        if (question.skipLogic && question.skipLogic.condition.length > 0) {
            if (question.skipLogic.condition.match('".+" = ".+"')) {
                let terms = question.skipLogic.condition.match(/"[^"]+"/g).map(function (t) {
                    return t.substr(1, t.length - 2);
                });
                if (terms.length === 2) {
                    let qToAddTo = questionsInSection[terms[0]];
                    // below is xmlBuilder ele. This seems to be the way to find child inside element
                    qToAddTo.children.filter(c => c.name === 'ListField')[0]
                        .children.filter(c => c.name === 'List')[0]
                        .children.filter(c => c.name === 'ListItem').forEach(function (li) {
                        if (li.attributes["title"] && li.attributes['title'].value === terms[1]) {
                            embed = true;
                            if (question.question.datatype === 'Value List') {
                                let liChildItems = li.children.filter(c => c.name === 'ChildItems')[0];
                                if (!liChildItems) liChildItems = li.ele({ChildItems: {}});
                                addQuestion(liChildItems, question);
                            } else {
                                if (question.label === "" || question.hideLabel) {
                                    li.ele({ListItemResponseField: {Response: {string: ""}}});
                                } else {
                                    let liChildItems2 = li.children.filter(c => c.name === 'ChildItems')[0];
                                    if (!liChildItems2) liChildItems2 = li.ele({ChildItems: {}});
                                    addQuestion(liChildItems2, question);
                                }
                            }
                        }
                    });
                }
            }
        }
    } catch (e) {
    }

    if (!embed) {
        addQuestion(parent, question);
    }
}

let questionsInSection = {};

let doSection = function (parent, section) {
    let newSection = {
        "@ID": "NA_" + Math.random(),
        "@title": section.label
    };
    let subSection = parent.ele({Section: newSection});
    if (section.formElements && section.formElements.length > 0) {
        let childItems = subSection.ele({ChildItems: {}});
        section.formElements.forEach(function (formElement) {
            if (formElement.elementType === 'question')
                doQuestion(childItems, formElement);
            else if (formElement.elementType === 'section' || formElement.elementType === 'form')
                doSection(childItems, formElement);
        });
    }
};

let idToName = {};

exports.formToSDC = function (form, renderer, cb) {
    let formDesign = builder.create({
        "FormDesign": {
            "@xmlns": "http://healthIT.gov/sdc",
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@xsi:schemaLocation": "http://healthIT.gov/sdc SDCFormDesign.xsd",
            "@ID": form.tinyId + "v" + form.version,
            "Header": {
                "@ID": "S1",
                "@title": form.naming[0].designation,
                "@styleClass": "left"
            }
        }
    }, {separateArrayItems: true, headless: true});

    let body = formDesign.ele({
        "Body": {
            "@ID": "NA_" + Math.random()
        }
    });

    let noSupport = false;

    let childItems = body.ele({ChildItems: {}});

    form.formElements.forEach(function (formElement) {
        if (formElement.elementType === 'section' || formElement.elementType === 'form') {
            doSection(childItems, formElement);
        } else {
            noSupport = "true";
        }
    });

    idToName = {};

    let xmlStr = formDesign.end({pretty: false});

    validator.validateXML(xmlStr, './modules/form/public/assets/sdc/SDCFormDesign.xsd', function (err) {
        if (err) {
            dbLogger.logError({
                message: "SDC Schema validation error: ",
                origin: "sdcForm.formToSDC",
                stack: err,
                details: "formID: " + form._id
            });
            xmlStr = "<!-- Validation Error: " + err + " -->" + xmlStr;
        }
        if (noSupport) {
            cb("SDC Export does not support questions outside of sections. ");
        } else if (renderer === "defaultHtml") {
            cb("<?xml-stylesheet type='text/xsl' href='/form/public/assets/sdc/sdctemplate.xslt'?> \n" + xmlStr);
        } else {
            cb(xmlStr);
        }
    });
};