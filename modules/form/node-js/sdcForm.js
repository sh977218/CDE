var xmlbuilder = require("xmlbuilder")
    , JXON = require('jxon')
;


//var addCardinality = function(parent, formElement) {
//    var card = parent.ele("mfi13:cardinality");
//    card.ele("mfi13:minimum", {}, "0");
//    card.ele("mfi13:maximum", {}, "1");
//};


function addQuestion(parent, question) {

    var newQuestion = {
        "Question": {
            "@ID": question.question.cde.tinyId + 'v' + question.question.cde.version
        }
    };

    if (question.label !== undefined) {
        newQuestion.Question["@title"] = question.label;
    }

    if (question.instructions) {
        newQuestion.Question.OtherText = {"@val": question.instructions};
    }

    if (question.question.datatype === 'Value List') {
        newQuestion.Question.ListField = {"List": {"ListItem": []}};
        if(question.question.multiselect) newQuestion.Question.ListField["@multiSelect"] = "true";

        if (question.question.answers) {
            question.question.answers.forEach(function(answer) {
                var title =  answer.valueMeaningName?answer.valueMeaningName:answer.permissibleValue;
                newQuestion.Question.ListField.List.ListItem.push({"@title": title});
            });
        }
    } else {
        newQuestion.Question.ResponseField = {"Response": ""};
    }

    parent.push(newQuestion);
}

function doQuestion(parent, question) {

    //addCardinality(newQuestion, question);

    var embed = false;

    try {
        if (question.skipLogic.condition.length > 0) {
            if (question.skipLogic.condition.match('".+" = ".+"')) {
                var terms = question.skipLogic.condition.match(/"[^"]+"/g).map(function(t) {
                    return t.substr(1, t.length - 2);
                });
                if (terms.length === 2) {
                    previousQ = parent[parent.length - 1].Question;
                    if(previousQ && previousQ["@title"] === terms[0]) {
                        previousQ.ListField.List.ListItem.forEach(function (li) {
                            if (li["@title"] === terms[1]) {
                                embed = true;
                                if (question.question.datatype === 'Value List') {
                                    if (li.ChildItems === undefined) li.ChildItems = [];
                                    addQuestion(li.ChildItems, question);
                                } else {
                                    if (question.label === "") {
                                        li.ListItemResponseField = {
                                            Response: {string: ""}
                                        }
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
        }
    } catch (e) {

    }

    if (!embed)
        addQuestion(parent, question);

}

var doSection = function(parent, section) {
    var newSection = {
        "Section": {
            "@title": section.label,
            "ChildItems": []
        }
    };

    section.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'question') {
            doQuestion(newSection.Section.ChildItems, formElement);
        } else if (formElement.elementType === 'section') {
            doSection(newSection.Section.ChildItems, formElement);
        }
    });

    parent.push(newSection);

    //addCardinality(newSection, section);

};

exports.formToSDC = function(form) {
    var root = {
        "FormDesign": {
            "@xmlns:sdc": "http://healthIT.gov/sdc",
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@xsi:schemaLocation": "http://healthIT.gov/sdc SDCFormDesign.xsd",
            "@formID": form.tinyId + "v" + form.version,
            "@baseItemURI": "https://cap.org/ecc/sdc",
            "Header": {
                "@ID": form.tinyId + "v" + form.version,
                "@title": form.naming[0].designation
            },
            "Body": {
                "ChildItems": []
            }
        }

    };

    form.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'section') {
            doSection(root.FormDesign.Body.ChildItems, formElement);
        }
    });

    console.log(JSON.stringify(root));

    return "<?xml-stylesheet type='text/xsl' href='/cde/public/html/sdctemplate.xslt'?> \n" +
        JXON.jsToString(root);

};