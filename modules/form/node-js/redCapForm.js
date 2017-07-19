var exportShared = require('../../system/shared/exportShared');

var existingVariables = {};
var label_variables_map = {};
var field_type_map = {
    "Text": "text",
    "Value List": "radio",
    "Number": "text",
    "Date": "text"
};
var text_validation_type_map = {
    "Text": "",
    "Value List": "",
    "Number": "number",
    "Date": "date"
};

exports.loopForm = function (form) {
    function loopFormElements(fe) {
        for (var i = 0; i < fe.formElements.length; i++) {
            var e = fe.formElements[i];
            if (e.elementType === 'section') {
                return loopFormElements(e, true);
            } else if (e.elementType !== 'question') {
                return 'unknownElementType';
            }
        }
        return false;
    }

    return loopFormElements(form, false);
};

function formatSkipLogic(text, map) {
    if (text) {
        text = text.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
        return text.replace(/"[A-z0-9 ()-]+" [=|<|>] "[A-z0-9 \(\)-]+"/g, function (segment) {
            return segment.replace(/"[A-z0-9 \(\)-]+"/, function (s) {
                s = s.replace(/"/g, '');
                return '[' + map[s] + ']';
            });
        });
    }
}

function getRedCap(form) {
    var instrumentResult = '';
    var loopFormElements = function (fe) {
        var sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
        var sectionHeader = '';
        if (fe.elementType === 'section') {
            sectionHeader = fe.label;
        }
        if (sectionsAsMatrix) {
            var answers = JSON.stringify(fe.formElements[0].question.answers);
            fe.formElements.forEach(function (e) {
                if (answers !== JSON.stringify(e.question.answers) || e.question.answers.length === 0) {
                    sectionsAsMatrix = false;
                }
            });
        }
        fe.formElements.forEach(function (e, i) {
            if (e.elementType === 'question') {
                var q = e.question;
                var questionSkipLogic = '';
                if (e.skipLogic)
                    questionSkipLogic = e.skipLogic.condition;
                var variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' + q.cde.tinyId.toLowerCase();
                if (existingVariables[variableName]) {
                    var index = existingVariables[variableName];
                    var newVariableName = variableName + "_" + index;
                    existingVariables[variableName] = index++;
                    existingVariables[newVariableName] = 1;
                    label_variables_map[e.label] = variableName;
                    variableName = newVariableName;
                } else {
                    existingVariables[variableName] = 1;
                    label_variables_map[e.label] = variableName;
                }
                var questionRow = {
                    'Variable / Field Name': variableName,
                    'Form Name': form.naming[0].designation,
                    'Section Header': i === 0 ? sectionHeader : '',
                    'Field Type': field_type_map[q.datatype],
                    'Field Label': e.label,
                    'Choices, Calculations, OR Slider Labels': q.answers.map(function (a) {
                        return a.permissibleValue + ',' + a.valueMeaningName;
                    }).join('|'),
                    'Field Note': '',
                    'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
                    'Text Validation Min': q.datatypeNumber ? q.datatypeNumber.minValue : '',
                    'Text Validation Max': q.datatypeNumber ? q.datatypeNumber.maxValue : '',
                    'Identifier?': '',
                    'Branching Logic (Show field only if...)': formatSkipLogic(questionSkipLogic, label_variables_map),
                    'Required Field?': q.required,
                    'Custom Alignment': '',
                    'Question Number (surveys only)': '',
                    'Matrix Group Name': sectionsAsMatrix ? sectionHeader : '',
                    'Matrix Ranking?': ''
                };
                instrumentResult += exportShared.convertToCsv(questionRow);
            }
            else if (e.elementType === 'section') {
                loopFormElements(e);
            }
            else {
                throw "unknown elementType";
            }
        });
        return instrumentResult;
    };

    return loopFormElements(form);
}

exports.formToRedCap = function (form) {
    var instrumentResult = getRedCap(form);
    return exportShared.exportHeader.redCapHeader + instrumentResult;
};