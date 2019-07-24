import { CdeForm } from 'shared/form/form.model';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { Parser } from 'json2csv';

const json2csvParser = new Parser({
    fields: [
        'Variable / Field Name',
        'Form Name',
        'Section Header',
        'Field Type',
        'Field Label',
        'Choices, Calculations, OR Slider Labels',
        'Field Note',
        'Text Validation Type OR Show Slider Number',
        'Text Validation Min',
        'Text Validation Max',
        'Identifier?',
        'Branching Logic (Show field only if...)',
        'Required Field?',
        'Custom Alignment',
        'Question Number (surveys only)',
        'Matrix Group Name',
        'Matrix Ranking?'
    ]
});

const field_type_map = {
    Text: 'text',
    'Value List': 'radio',
    Number: 'text',
    Date: 'text'
};
const text_validation_type_map = {
    Text: '',
    'Value List': '',
    Number: 'number',
    Date: 'date'
};

export class RedcapExport {

    static getZipRedCap(form) {
        RedcapExport.oneLayerForm(form);

        let instrumentResult = RedcapExport.getRedCap(form);

        let zip = new JSZip();
        zip.file('AuthorID.txt', "NLM");
        zip.file('InstrumentID.txt', form.tinyId);
        zip.file('instrument.csv', instrumentResult);

        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, form.designations[0].designation + '.zip'));
    }

    /*
    |---------------|           |---------------|
    |   S1          |           |   S1          |
    |       Q1      |           |       Q1      |
    |       Q11      |          |       Q11     |
    |       S2      |           |   S1-S2       |
    |           Q2  |    ==>    |       Q2      |
    |   Q3          |           |   S3(new)     |
    |               |           |       Q3      |
    |   S4          |           |   S4          |
    |       Q4      |           |       Q4      |
    |---------------|           |---------------|
    */
    static oneLayerForm(form) {
        function doSection(sFormElement) {
            let formElements = [];
            for (let fe of sFormElement.formElements) {
                if (fe.elementType === 'question') {
                    formElements.push(fe);
                } else {
                    let questions = doSection(fe);
                    formElements = formElements.concat(questions);
                }
            }
            return formElements;
        }


        let formElements = [];
        let newSection = {
            elementType: 'section',
            label: '',
            formElements: []
        };
        for (let formElement of form.formElements) {
            let type = formElement.elementType;
            if (type === 'question') {
                newSection.formElements.push(formElement);
            } else {
                if (newSection.formElements.length > 0) {
                    formElements.push(newSection);
                    newSection = {
                        elementType: 'section',
                        label: '',
                        formElements: []
                    };
                }
                formElement.formElements = doSection(formElement);
                formElements.push(formElement);
            }
        }
        form.formElements = formElements;
    }


    static formatSkipLogic(skipLogicString, map) {
        let redCapSkipLogic = skipLogicString;
        let _skipLogicString = skipLogicString.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
        let foundEquationArray = _skipLogicString.match(/"([^"])+"/g);
        if (foundEquationArray && foundEquationArray.length > 0) {
            foundEquationArray.forEach((label, i) => {
                if (i % 2 === 0) {
                    let foundVariable = map[label.replace(/\"/g, '')];
                    redCapSkipLogic = redCapSkipLogic.replace(label, '[' + foundVariable + ']');
                }
            });
        } else redCapSkipLogic = "Error Parse " + skipLogicString;
        return redCapSkipLogic;
    }


    static getRedCap(form: CdeForm) {
        let existingVariables = {};
        let label_variables_map = {};
        let variableCounter = 1;
        let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;
        let doSection = (formElement, i) => {
            let sectionHeader = formElement.label ? formElement.label : '';
            let fieldLabel = formElement.instructions ? formElement.instructions.value : '';
            if (sectionsAsMatrix) {
                let temp = _uniqWith(formElement.formElements, (a: any, b) => _isEqual(a.question.answers, b.question.answers));
                if (temp.length > 1) sectionsAsMatrix = false;
            }
            let _sectionSkipLogic = '';
            let sectionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (sectionSkipLogic) _sectionSkipLogic = RedcapExport.formatSkipLogic(sectionSkipLogic, label_variables_map);
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
        let doQuestion = formElement => {
            let q = formElement.question;
            let _questionSkipLogic = '';
            let questionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (questionSkipLogic) _questionSkipLogic = this.formatSkipLogic(questionSkipLogic, label_variables_map);
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
            instrumentJsonRows.push(doSection(formElement, sectionIndex));
            for (let fe of formElement.formElements) {
                instrumentJsonRows.push(doQuestion(fe));
            }
        }
        return json2csvParser.parse(instrumentJsonRows);
    }
}
