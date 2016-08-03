var JXON = require('jxon'),
    validator = require('xsd-schema-validator')
    ;


//var addCardinality = function(parent, formElement) {
//    var card = parent.ele("mfi13:cardinality");
//    card.ele("mfi13:minimum", {}, "0");
//    card.ele("mfi13:maximum", {}, "1");
//};


function addQuestion(parent, question) {

    var newQuestion = {
        "Question": {
            "@ID": question.question.cde.tinyId
        }
    };

    if (question.label !== undefined && !question.hideLabel) {
        newQuestion.Question["@title"] = question.label;
    }

    if (question.instructions) {
        newQuestion.Question.OtherText = {"@val": question.instructions};
    }

    if (question.question.datatype === 'Value List') {
        newQuestion.Question.ListField = {"List": {"ListItem": []}};
        if (question.question.multiselect) newQuestion.Question.ListField["@multiSelect"] = "true";

        if (question.question.answers) {
            question.question.answers.forEach(function (answer) {
                var title = answer.valueMeaningName ? answer.valueMeaningName : answer.permissibleValue;
                newQuestion.Question.ListField.List.ListItem.push({"@title": title});
            });
        }
    } else {
        newQuestion.Question.ResponseField = {"Response": ""};
    }

    idToName[question.question.cde.tinyId] = question.label;

    questionsInSection[question.label] = newQuestion;
    parent.push(newQuestion);
}

function doQuestion(parent, question) {

    //addCardinality(newQuestion, question);

    var embed = false;

    try {
        if (question.skipLogic.condition.length > 0) {
            if (question.skipLogic.condition.match('".+" = ".+"')) {
                var terms = question.skipLogic.condition.match(/"[^"]+"/g).map(function (t) {
                    return t.substr(1, t.length - 2);
                });
                if (terms.length === 2) {
                    var qToAddTo = questionsInSection[terms[0]].Question;
                    qToAddTo.ListField.List.ListItem.forEach(function (li) {
                        if (li["@title"] === terms[1]) {
                            embed = true;
                            if (question.question.datatype === 'Value List') {
                                if (li.ChildItems === undefined) li.ChildItems = [];
                                addQuestion(li.ChildItems, question);
                            } else {
                                if (question.label === "" || question.hideLabel) {
                                    li.ListItemResponseField = {
                                        Response: {string: ""}
                                    };
                                } else {
                                    if (li.ChildItems === undefined) li.ChildItems = [];
                                    addQuestion(li.ChildItems, question);
                                }
                            }
                        }
                    });
                }
            }
        }
    } catch (e) {

    }

    if (!embed)
        addQuestion(parent, question);

}

var questionsInSection = {};

var doSection = function (parent, section) {
    var newSection = {
        "Section": {
            "@title": section.label,
            "ChildItems": []
        }
    };

    section.formElements.forEach(function (formElement) {
        if (formElement.elementType === 'question') {
            doQuestion(newSection.Section.ChildItems, formElement);
        } else if (formElement.elementType === 'section' || formElement.elementType === 'form') {
            doSection(newSection.Section.ChildItems, formElement);
        }
    });

    questionsInSection = {};
    parent.push(newSection);

    //addCardinality(newSection, section);

};

var idToName = {};

exports.formToSDC = function (form) {
    var root = {
        "FormDesign": {
            "@xmlns:sdc": "http://healthIT.gov/sdc",
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@xsi:schemaLocation": "http://healthIT.gov/sdc SDCFormDesign.xsd",
            "@formID": form.tinyId + "v" + form.version,
            "@baseItemURI": "https://cap.org/ecc/sdc",
            "Header": {
                "@ID": "S1",
                "@title": form.naming[0].designation,
                "@styleClass": "left"
            },
            "Body": {
                "ChildItems": []
            }
        }
    };

    form.formElements.forEach(function (formElement) {
        if (formElement.elementType === 'section' || formElement.elementType === 'form') {
            doSection(root.FormDesign.Body.ChildItems, formElement);
        }
    });

    idToName = {};

    var xmlStr = JXON.jsToString(root);

    console.log(xmlStr);

    validator.validateXML(xmlStr, './modules/form/public/assets/sdc/SDCFormDesign.xsd', function (err, result) {
        console.log("Is Export Valid: " + JSON.stringify(result));
    });

    return "<?xml-stylesheet type='text/xsl' href='/form/public/assets/sdc/sdctemplate.xslt'?> \n" + xmlStr;

};