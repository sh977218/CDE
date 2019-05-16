import { CdeForm } from 'shared/form/form.model';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import * as Json2csvParser from 'json2csv';

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

    existingVariables = {};
    label_variables_map = {};

    getZipRedCap(form) {
        let instrumentResult = this.getRedCap(form);

        let zip = new JSZip();
        zip.file('AuthorID.txt', "NLM");
        zip.file('InstrumentID.txt', form.tinyId);
        zip.file('instrument.csv', instrumentResult);

        zip.generateAsync({type: 'blob'}).then(content => saveAs(content, 'SearchExport_XML.zip'));
    }

    formatSkipLogic(skipLogicString, map) {
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


    getRedCap(form: CdeForm) {
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
            if (sectionSkipLogic) _sectionSkipLogic = this.formatSkipLogic(sectionSkipLogic, this.label_variables_map);
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
            if (questionSkipLogic) _questionSkipLogic = this.formatSkipLogic(questionSkipLogic, this.label_variables_map);
            if (!q.cde.tinyId) q.cde.tinyId = 'missing question cde';
            let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' +
                variableCounter++ + "_" + q.cde.tinyId.toLowerCase();
            if (this.existingVariables[variableName]) {
                let index = this.existingVariables[variableName];
                let newVariableName = variableName + '_' + index;
                this.existingVariables[variableName] = index++;
                this.existingVariables[newVariableName] = 1;
                this.label_variables_map[formElement.label] = variableName;
                variableName = newVariableName;
            } else {
                this.existingVariables[variableName] = 1;
                this.label_variables_map[formElement.label] = variableName;
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
        return Json2csvParser.parse(instrumentJsonRows);
    }


}