const _ = require('lodash');
const archiver = require("archiver");
const exportShared = require('esm')(module)('../../shared/system/exportShared');
const field_type_map = {
    "Text": "text",
    "Value List": "radio",
    "Number": "text",
    "Date": "text"
};
const text_validation_type_map = {
    "Text": "",
    "Value List": "",
    "Number": "number",
    "Date": "date"
};

let existingVariables = {};
let label_variables_map = {};

function formatSkipLogic(text, map) {
    if (text) {
        text = text.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
        return text.replace(/"[A-z0-9 ()-]+" [=|<|>] "[A-z0-9 \(\)-]+"/g, segment => {
            return segment.replace(/"[A-z0-9 \(\)-]+"/, s => {
                s = s.replace(/"/g, '');
                return '[' + map[s] + ']';
            });
        });
    }
}

function getRedCap(form) {
    let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
    let instrumentResult = '';
    let doSection = (formElement) => {
        let sectionHeader = formElement.label;
        if (sectionsAsMatrix) {
            let temp = _.uniqBy(formElement.formElements, (a, b) => {
                return _.isEqual(a.question.answers, b.question.answers)
            });
            if (temp.length > 1) sectionsAsMatrix = false;
        }
        return {
            'Variable / Field Name': variableName,
            'Form Name': form.designations[0].designation,
            'Section Header': sectionHeader,
            'Field Type': 'descriptive',
            'Field Label': formElement.label,
            'Choices, Calculations, OR Slider Labels': q.answers.map(function (a) {
                return a.permissibleValue + ',' + a.valueMeaningName;
            }).join('|'),
            'Field Note': '',
            'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
            'Text Validation Min': q.datatypeNumber ? q.datatypeNumber.minValue : '',
            'Text Validation Max': q.datatypeNumber ? q.datatypeNumber.maxValue : '',
            'Identifier?': '',
            'Branching Logic (Show field only if...)': formatSkipLogic(questionSkipLogic, label_variables_map),
            'Required Field?':'',
            'Custom Alignment': '',
            'Question Number (surveys only)': '',
            'Matrix Group Name': sectionsAsMatrix ? sectionHeader : '',
            'Matrix Ranking?': ''
        };


        for (let fe of formElement.formElements) {
            let q = fe.question;
            let questionSkipLogic = fe.skipLogic ? fe.skipLogic.condition : '';
            if (!q.cde.tinyId) q.cde.tinyId = "missing question cde";
            let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' + q.cde.tinyId.toLowerCase();
            if (existingVariables[variableName]) {
                let index = existingVariables[variableName];
                let newVariableName = variableName + "_" + index;
                existingVariables[variableName] = index++;
                existingVariables[newVariableName] = 1;
                label_variables_map[fe.label] = variableName;
                variableName = newVariableName;
            } else {
                existingVariables[variableName] = 1;
                label_variables_map[fe.label] = variableName;
            }
            let questionRow = {
                'Variable / Field Name': variableName,
                'Form Name': form.designations[0].designation,
                'Section Header': i === 0 ? sectionHeader : '',
                'Field Type': field_type_map[q.datatype],
                'Field Label': fe.label,
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
    };
    let doQuestion = (formElement) => {

    };
    for (let formElement of form.formElements) {
        let sectionResult = doSection(formElement);
        let questionResult = '';
        for (let fe of formElement.formElements) {
            questionResult = questionResult + doQuestion(fe);
        }
        instrumentResult = instrumentResult + sectionResult + questionResult;
    }
    return instrumentResult;
}

function formToRedCap(form) {
    let instrumentResult = getRedCap(form);
    return exportShared.exportHeader.redCapHeader + instrumentResult;
}

exports.getZipRedCap = function (form, res) {
    res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-disposition": "attachment; filename=" + form.designations[0].designation + ".zip"
    });
    let zip = archiver("zip", {});
    zip.on("error", function (err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    zip.on("end", function () {
    });
    zip.pipe(res);
    zip.append("NLM", {name: "AuthorID.txt"})
        .append(form.tinyId, {name: "InstrumentID.txt"})
        .append(formToRedCap(form), {name: "instrument.csv"})
        .finalize();
};

