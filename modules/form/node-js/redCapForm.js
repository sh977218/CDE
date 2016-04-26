var label_variable_map = {};
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

function getRedCap(form, instrumentResult) {
    function loopFormElements(fe) {
        fe.formElements.forEach(function (e) {
            if (e.elementType === 'question') {
                var q = e.question;
                var questionSkipLogic;
                if (e.skipLogic)
                    questionSkipLogic = e.skipLogic.condition;
                var questionVariableName = 'nlmcde_' + q.cde.tinyId.toLowerCase() + '_' + form.version;
                label_variable_map[e.label] = questionVariableName;
                var questionRow = {
                    'Variable / Field Name': questionVariableName,
                    'Form Name': form.naming[0].designation,
                    'Section Header': '',
                    'Field Type': field_type_map[q.datatype],
                    'Field Label': e.label,
                    'Choices, Calculations, OR Slider Labels': q.answers.map(function (a) {
                        return a.permissibleValue + ',' + a.valueMeaningName;
                    }).join('|'),
                    'Field Note': '',
                    'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
                    'Text Validation Min': '',
                    'Text Validation Max': '',
                    'Identifier?': '',
                    'Branching Logic (Show field only if...)': formatSkipLogic(questionSkipLogic, label_variable_map),
                    'Required Field?': q.required,
                    'Custom Alignment': '',
                    'Question Number (surveys only)': '',
                    'Matrix Group Name': '',
                    'Matrix Ranking?': ''
                };
                instrumentResult += exports.convertToCsv(questionRow) + '\n';
            }
            else if (e.elementType === 'section') {
                var sectionSkipLogic;
                if (e.skipLogic)
                    sectionSkipLogic = e.skipLogic.condition;
                var sectionVariableName = 'nlmcde_' + '@TODO' + '_' + form.version;
                label_variable_map[e.label] = sectionVariableName;
                var sectionRow = {
                        'Variable / Field Name': sectionVariableName,
                        'Form Name': form.naming[0].designation,
                        'Section Header': '',
                        'Field Type': '',
                        'Field Label': e.label,
                        'Choices, Calculations, OR Slider Labels': '',
                        'Field Note': '',
                        'Text Validation Type OR Show Slider Number': '',
                        'Text Validation Min': '',
                        'Text Validation Max': '',
                        'Identifier?': '',
                        'Branching Logic (Show field only if...)': formatSkipLogic(sectionSkipLogic, label_variable_map),
                        'Required Field?': '',
                        'Custom Alignment': '',
                        'Question Number (surveys only)': '',
                        'Matrix Group Name': '',
                        'Matrix Ranking?': ''
                    }
                    ;
                instrumentResult += exports.convertToCsv(sectionRow) + '\n';
            }
            else {
                console.log('unknown elementType');
            }
        });
    }

    return loopFormElements(form);
}

exports.formToRedCap = function (form) {
    var instrumentResult = 'Variable / Field Name,Form Name,Section Header,Field Type,Field Label,Choices Calculations OR Slider Labels,Field Note,Text Validation Type OR Show Slider Number,Text Validation Min,Text Validation Max,Identifier?,Branching Logic (Show field only if...),Required Field?,Custom Alignment,Question Number (surveys only),Matrix Group Name,Matrix Ranking?\n';
    getRedCap(form, instrumentResult);
    return instrumentResult;
};