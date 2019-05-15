const _ = require('lodash');
const archiver = require('archiver');
const Json2csvParser = require('json2csv').parse;
const config = require('../system/parseConfig');
const field_type_map = {
    'Text': 'text',
    'Value List': 'radio',
    'Number': 'text',
    'Date': 'text'
};
const text_validation_type_map = {
    'Text': '',
    'Value List': '',
    'Number': 'number',
    'Date': 'date'
};

let existingVariables = {};
let label_variables_map = {};

function formatSkipLogic(skipLogicString, map) {
    let redCapSkipLogic = skipLogicString;
    let _skipLogicString = skipLogicString.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
    let foundEquationArray = _skipLogicString.match(/"([^"])+"/g);
    if (foundEquationArray && foundEquationArray.length > 0) {
        foundEquationArray.forEach((label, i) => {
            if (i % 2 === 0) {
                let foundVariable = map[label.replace(/\"/g, '')];
                redCapSkipLogic = redCapSkipLogic.replace(label, '[' + foundVariable + ']');
            }
        })
    } else redCapSkipLogic = "Error Parse " + skipLogicString;
    return redCapSkipLogic;
}

function getRedCap(form) {
    let variableCounter = 1;
    let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
    let doSection = (formElement, i) => {
        let sectionHeader = formElement.label ? formElement.label : '';
        let fieldLabel = formElement.instructions ? formElement.instructions.value : '';
        if (sectionsAsMatrix) {
            let temp = _.uniqWith(formElement.formElements, (a, b) => _.isEqual(a.question.answers, b.question.answers));
            if (temp.length > 1) sectionsAsMatrix = false;
        }
        let _sectionSkipLogic = '';
        let sectionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
        if (sectionSkipLogic) _sectionSkipLogic = formatSkipLogic(sectionSkipLogic, label_variables_map);
        return {
            'Variable / Field Name': 'insect_' + i,
            'Form Name': form.designations[0].designation,
            'Section Header': sectionHeader,
            'Field Type': 'descriptive',
            'Field Label': fieldLabel,
            'Choices, Calculations, OR Slider Labels': '',
            'Field Note': '',
            'Text Validation Type OR Show Slider Number': '',
            'Text Validation Min': '',
            'Text Validation Max': '',
            'Identifier?': '',
            'Branching Logic (Show field only if...)': _sectionSkipLogic,
            'Required Field?': '',
            'Custom Alignment': '',
            'Question Number (surveys only)': '',
            'Matrix Group Name': sectionsAsMatrix ? sectionHeader : '',
            'Matrix Ranking?': ''
        };
    };
    let doQuestion = (formElement) => {
        let q = formElement.question;
        let _questionSkipLogic = '';
        let questionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
        if (questionSkipLogic) _questionSkipLogic = formatSkipLogic(questionSkipLogic, label_variables_map);
        if (!q.cde.tinyId) q.cde.tinyId = 'missing question cde';
        let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' +
            variableCounter++ + "_" + q.cde.tinyId.toLowerCase();
        if (existingVariables[variableName]) {
            let index = existingVariables[variableName];
            let newVariableName = variableName + '_' + index;
            existingVariables[variableName] = index++;
            existingVariables[newVariableName] = 1;
            label_variables_map[formElement.label] = variableName;
            variableName = newVariableName;
        } else {
            existingVariables[variableName] = 1;
            label_variables_map[formElement.label] = variableName;
        }

        let fieldLabel = formElement.label;
        return {
            'Variable / Field Name': variableName,
            'Form Name': form.designations[0].designation,
            'Section Header': '',
            'Field Type': field_type_map[q.datatype],
            'Field Label': fieldLabel,
            'Choices, Calculations, OR Slider Labels': (q.answers || []).map(a => a.permissibleValue + ',' + a.valueMeaningName).join('|'),
            'Field Note': '',
            'Text Validation Type OR Show Slider Number': text_validation_type_map[q.datatype],
            'Text Validation Min': q.datatypeNumber ? q.datatypeNumber.minValue : '',
            'Text Validation Max': q.datatypeNumber ? q.datatypeNumber.maxValue : '',
            'Identifier?': '',
            'Branching Logic (Show field only if...)': _questionSkipLogic,
            'Required Field?': q.required,
            'Custom Alignment': '',
            'Question Number (surveys only)': '',
            'Matrix Group Name': '',
            'Matrix Ranking?': ''
        };
    };

    let instrumentJsonRows = [];
    let sectionIndex = 0;
    for (let formElement of form.formElements) {
        sectionIndex++;
        let sectionResult = doSection(formElement, sectionIndex);
        instrumentJsonRows.push(sectionResult);
        for (let fe of formElement.formElements) {
            let questionResult = doQuestion(fe);
            instrumentJsonRows.push(questionResult);
        }
    }
    return Json2csvParser(instrumentJsonRows);
}

exports.getZipRedCap = function (form, res) {
    switch (config.provider.faas) {
        case 'AWS':
            const AWS = require('aws-sdk');
            if (!global.CURRENT_SERVER_ENV) {
                throw new Error('ENV not ready');
            }
            let jsonPayload = {
                input: form
            };
            let params = {
                FunctionName: config.cloudFunction.zipExport.name + '-' + global.CURRENT_SERVER_ENV,
                Payload: JSON.stringify(jsonPayload)
            };

            new AWS.Lambda({region: 'us-east-1'}).invoke(params, (err, result) => {
                res.send(result);
            });
            break;
        case 'ON_PREM':
            exports.getOnPremZipRedCap(form, res);
            break;
        default:
            throw new Error('not supported');
    }
};

exports.getOnPremZipRedCap = function (form, res) {
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=' + form.designations[0].designation + '.zip'
    });

    let instrumentResult = getRedCap(form);
    let zip = archiver('zip', {});
    let hasError = false;
    zip.on('error', err => res.status(500).send({error: err.message}));

    //on stream closed we can end the request
    zip.on('end', function () {
    });
    if (!hasError) {
        zip.pipe(res);
        zip.append('NLM', {name: 'AuthorID.txt'})
            .append(form.tinyId, {name: 'InstrumentID.txt'})
            .append(instrumentResult, {name: 'instrument.csv'})
            .finalize();
    }
};

