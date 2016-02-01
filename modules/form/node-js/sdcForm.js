var xmlbuilder = require("xmlbuilder")
    , config = require('../../system/node-js/parseConfig')
;


var addCardinality = function(parent, formElement) {
    var card = parent.ele("mfi13:cardinality");
    card.ele("mfi13:minimum", {}, "0");
    card.ele("mfi13:maximum", {}, "1");
};

var doQuestion = function(parent, question) {
    var newQuestion = parent.ele("Question",
        {"ID": question.question.cde.tinyId + 'v' + question.question.cde.version,
        title: question.label});

    //addCardinality(newQuestion, question);

    if (question.instructions)
        newQuestion.ele("OtherText", {val: question.instructions});

    var lf = newQuestion.ele("ListField");

    if (question.question.datatype === 'Value List') {
        var list = lf.ele("List");
        if(question.question.multiselect) lf.att("multiSelect", "true");

        if (question.question.answers) {
            question.question.answers.forEach(function(answer) {
                var title =  answer.valueMeaningName?answer.valueMeaningName:answer.permissibleValue;
                var li = list.ele("ListItem", {title: title});
            });
        }
    } else {
        newQuestion.ele("ResponseField").ele("Response");
    }

};

var doSection = function(parent, section) {
    var newSection = parent.ele("Section",
        {title: section.label});

    //addCardinality(newSection, section);

    //var title = newSection.ele("sdc:section_title");
    //var label = title.ele("mfi13:label", {}, section.label);

    //var inst = newSection.ele("sdc:section_instruction");
    //inst.ele("mfi13:label", {}, section.instructions);

    var childItems = newSection.ele("ChildItems");
    section.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'question') {
            doQuestion(childItems, formElement);
        } else if (formElement.elementType === 'section') {
            doSection(childItems, formElement);
        }
    });

};

exports.formToSDC = function(form) {
    var formDesign = xmlbuilder.create("FormDesign");
    formDesign.att("xmlns:sdc", "http://healthIT.gov/sdc");
    formDesign.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    formDesign.att("xsi:schemaLocation", "http://healthIT.gov/sdc SDCFormDesign.xsd");
    formDesign.att("formID", "ID=129/v=2.004.001/");
    formDesign.att("baseItemURI", "https://cap.org/ecc/sdc");

    var header = formDesign.ele("Header", {
        "ID": form.tinyId + "v" + form.version,
        "title": form.naming[0].designation,
    });

    var body = formDesign.ele("Body");

    var childItems = body.ele("ChildItems");

    form.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'section') {
            doSection(childItems, formElement);
        }
    });

    return "<?xml-stylesheet type='text/xsl' href='/cde/public/html/sdctemplate.xslt'?> \n" +
        formDesign.toString();
};