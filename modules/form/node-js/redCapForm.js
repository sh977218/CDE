const archiver = require("archiver");
const exportShared = require('@std/esm')(module)('../../system/shared/exportShared');
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

const redCapExportWarnings = {
    "PhenX": "You can download PhenX REDCap from <a class='alert-link' href='https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist'>here</a>.",
    "PROMIS / Neuro-QOL": "You can download PROMIS / Neuro-QOL REDCap from <a class='alert-link' href='http://project-redcap.org/'>here</a>.",
    "emptySection": "REDCap cannot support empty section.",
    "nestedSection": "REDCap cannot support nested section.",
    "unknownElementType": "This form has error."
};

let existingVariables = {};
let label_variables_map = {};

function loopForm(form) {
    function loopFormElements(fe) {
        for (let i = 0; i < fe.formElements.length; i++) {
            let e = fe.formElements[i];
            if (e.elementType === 'section') {
                return loopFormElements(e, true);
            } else if (e.elementType !== 'question') {
                return 'unknownElementType';
            }
        }
        return false;
    }

    return loopFormElements(form, false);
}

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
    let instrumentResult = '';
    let loopFormElements = function (fe) {
        let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
        let sectionHeader = '';
        if (fe.elementType === 'section') {
            sectionHeader = fe.label;
        }
        if (sectionsAsMatrix) {
            let answers = JSON.stringify(fe.formElements[0].question.answers);
            fe.formElements.forEach(function (e) {
                if (answers !== JSON.stringify(e.question.answers) || e.question.answers.length === 0) {
                    sectionsAsMatrix = false;
                }
            });
        }
        fe.formElements.forEach(function (e, i) {
            if (e.elementType === 'question') {
                let q = e.question;
                let questionSkipLogic = '';
                if (e.skipLogic)
                    questionSkipLogic = e.skipLogic.condition;
                let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' + q.cde.tinyId.toLowerCase();
                if (existingVariables[variableName]) {
                    let index = existingVariables[variableName];
                    let newVariableName = variableName + "_" + index;
                    existingVariables[variableName] = index++;
                    existingVariables[newVariableName] = 1;
                    label_variables_map[e.label] = variableName;
                    variableName = newVariableName;
                } else {
                    existingVariables[variableName] = 1;
                    label_variables_map[e.label] = variableName;
                }
                let questionRow = {
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
            else if (e.elementType === 'section')
                loopFormElements(e);
            else throw "unknown elementType";
        });
        return instrumentResult;
    };
    return loopFormElements(form);
}

function formToRedCap(form) {
    let instrumentResult = getRedCap(form);
    return exportShared.exportHeader.redCapHeader + instrumentResult;
}

exports.getZipRedCap = function (form, res) {
    if (redCapExportWarnings[form.stewardOrg.name])
        return res.status(202).send(redCapExportWarnings[form.stewardOrg.name]);
    let validationErr = loopForm(form);
    if (validationErr) return res.status(500).send(redCapExportWarnings[validationErr]);
    res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-disposition": "attachment; filename=" + form.naming[0].designation + ".zip"
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

