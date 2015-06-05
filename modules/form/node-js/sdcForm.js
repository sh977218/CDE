var mongo_data = require("./mongo-form")
    , xmlbuilder = require("xmlbuilder")
    , config = require('../../system/node-js/parseConfig')
;


var addCardinality = function(parent, formElement) {
    var card = parent.ele("mfi13:cardinality");
    card.ele("mfi13:minimum", {}, "0");
    card.ele("mfi13:maximum", {}, "1");
};

var doQuestion = function(parent, question) {
    var newQuestion = parent.ele("sdc:question",
        {"initial_state": "enabled",
        "data_element_scoped_identifier": config.publicUrl + "/debytinyid/" +
            question.question.cde.tinyId + "/" + question.question.cde.version});

    addCardinality(newQuestion, question);

    newQuestion.ele("sdc:question_prompt").ele("mfi13:label", {}, question.label);

    if (question.question.datatype === 'Value List') {
        var lf = newQuestion.ele("sdc.list_field");
        lf.ele("mfi13:multiselect", {}, question.question.multiselect === true);
        if (question.question.answers) {
            question.question.answers.forEach(function(answer) {
                var li = lf.ele("sdc:list_item");
                li.ele("mfi13:value", {}, answer.permissibleValue);
                li.ele("mfi13:item_prompt").ele("mfi13:label", {}, answer.permissibleValue);
                //li.ele("mfi13:value_meaning").ele("mfi13:label", {}, answer.valueMeaningName);
                li.ele("sdc:value_meaning_terminology_code", {}, answer.valueMeaningCode);
                li.ele("sdc:value_meaning_code_name", {}, answer.valueMeaningName);
                li.ele("sdc:value_meaning_code_system_name", {}, answer.valueMeaningCodeSystem);
            });
        }

    }

};

var doSection = function(parent, section) {
    var newSection = parent.ele("sdc:section", {"initial_state": "enabled"});

    addCardinality(newSection, section);

    var title = newSection.ele("sdc:section_title");
    var label = title.ele("mfi13:label", {}, section.label);

    var inst = newSection.ele("sdc:section_instruction");
    inst.ele("mfi13:label", {}, section.instructions);

    section.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'question') {
              doQuestion(newSection, formElement);
        }
    });

};

exports.formToSDC = function(form) {
    var formPackage = xmlbuilder.create("sdc:form_package");
    formPackage.att("xmlns:sdc", "http://nlm.nih.gov/sdc/for");
    formPackage.att("xmlns:mfi13", "http://www.iso.org/19763/13/2013");
    var formDesign = formPackage.ele("sdc:form_design");

    var sdcDesignation = formDesign.ele("sdc:designation");
    sdcDesignation.ele("sdc:Context", {}, "SDC Pilot Project");
    sdcDesignation.ele("sdc:sign", {acceptability: "preferred"}, form.naming[0].designation);

    form.formElements.forEach(function(formElement) {
        if (formElement.elementType === 'section') {
            doSection(formDesign, formElement);
        }
    });

    return formPackage.toString();
};