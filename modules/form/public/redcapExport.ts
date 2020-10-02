import { Dictionary } from 'async';
import { saveAs } from 'file-saver';
import { Parser } from 'json2csv';
import * as JSZip from 'jszip';
import * as _isEqual from 'lodash/isEqual';
import * as _uniqWith from 'lodash/uniqWith';
import { CdeForm, FormElement, FormElementsContainer, FormQuestion, FormSection } from 'shared/form/form.model';
import { isQuestion } from 'shared/form/fe';

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

const datatTypeToRedcapDataType: Dictionary<string> = {
    Text: 'text',
    'Value List': 'radio',
    Number: 'text',
    Date: 'text'
};
const datatTypeToRedcapValidationType: Dictionary<string> = {
    Text: '',
    'Value List': '',
    Number: 'number',
    Date: 'date'
};

export class RedcapExport {

    static getZipRedCap(form: CdeForm) {
        RedcapExport.oneLayerForm(form);

        const instrumentResult = RedcapExport.getRedCap(form);

        const zip = new JSZip();
        zip.file('AuthorID.txt', 'NLM');
        zip.file('InstrumentID.txt', form.tinyId);
        zip.file('instrument.csv', instrumentResult);

        zip.generateAsync({type: 'blob'}).then((content: any) => saveAs(content, form.designations[0].designation + '.zip'));
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
    static oneLayerForm(form: FormElementsContainer) {
        function doSection(sFormElement: FormElementsContainer): FormElement[] {
            let formElements: FormElement[] = [];
            for (const fe of sFormElement.formElements) {
                if (fe.elementType === 'question') {
                    formElements.push(fe);
                } else {
                    const questions = doSection(fe);
                    formElements = formElements.concat(questions);
                }
            }
            return formElements;
        }


        const formElements: FormElement[] = [];
        let newSection: FormSection = {
            elementType: 'section',
            label: '',
            formElements: [],
            section: {},
        };
        for (const formElement of form.formElements) {
            const type = formElement.elementType;
            if (type === 'question') {
                newSection.formElements.push(formElement);
            } else {
                if (newSection.formElements.length > 0) {
                    formElements.push(newSection);
                    newSection = {
                        elementType: 'section',
                        label: '',
                        formElements: [],
                        section: {}
                    };
                }
                formElement.formElements = doSection(formElement);
                formElements.push(formElement);
            }
        }
        form.formElements = formElements;
    }

    static formatSkipLogic(skipLogicString: string, map: Dictionary<string>) {
        let redCapSkipLogic = skipLogicString;
        const _skipLogicString = skipLogicString.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ');
        const foundEquationArray = _skipLogicString.match(/"([^"])+"/g);
        if (foundEquationArray && foundEquationArray.length > 0) {
            foundEquationArray.forEach((label, i) => {
                if (i % 2 === 0) {
                    const foundVariable = map[label.replace(/\"/g, '')];
                    redCapSkipLogic = redCapSkipLogic.replace(label, '[' + foundVariable + ']');
                }
            });
        } else { redCapSkipLogic = 'Error Parse ' + skipLogicString; }
        return redCapSkipLogic;
    }


    static getRedCap(form: CdeForm) {
        const existingVariables: Dictionary<number> = {};
        const labelToVariablesMap: Dictionary<string> = {};
        let variableCounter = 1;
        let sectionsAsMatrix = form.displayProfiles && form.displayProfiles[0] && form.displayProfiles[0].sectionsAsMatrix;

        function oneLayerFormconvertSectionToRow(formElement: FormElement, i: number) {
            const sectionHeader = formElement.label ? formElement.label : '';
            const fieldLabel = formElement.instructions ? formElement.instructions.value : '';
            if (sectionsAsMatrix) {
                const temp = _uniqWith(formElement.formElements, (a: FormElement, b: FormElement) => _isEqual(
                    isQuestion(a) && a.question.datatype === 'Value List' && a.question.answers,
                    isQuestion(b) && b.question.datatype === 'Value List' && b.question.answers
                ));
                if (temp.length > 1) { sectionsAsMatrix = false; }
            }
            let _sectionSkipLogic = '';
            const sectionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (sectionSkipLogic) { _sectionSkipLogic = RedcapExport.formatSkipLogic(sectionSkipLogic, labelToVariablesMap); }
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
        }

        function oneLayerFormconvertQuestionToRow(formElement: FormQuestion) {
            const q = formElement.question;
            let _questionSkipLogic = '';
            const questionSkipLogic = formElement.skipLogic ? formElement.skipLogic.condition : '';
            if (questionSkipLogic) { _questionSkipLogic = RedcapExport.formatSkipLogic(questionSkipLogic, labelToVariablesMap); }
            if (!q.cde.tinyId) { q.cde.tinyId = 'missing question cde'; }
            let variableName = 'nlmcde_' + form.tinyId.toLowerCase() + '_' +
                variableCounter++ + '_' + q.cde.tinyId.toLowerCase();
            if (existingVariables[variableName]) {
                let index = existingVariables[variableName];
                const newVariableName = variableName + '_' + index;
                existingVariables[variableName] = index++;
                existingVariables[newVariableName] = 1;
                labelToVariablesMap[formElement.label || ''] = variableName;
                variableName = newVariableName;
            } else {
                existingVariables[variableName] = 1;
                labelToVariablesMap[formElement.label || ''] = variableName;
            }

            const fieldLabel = formElement.label;
            return {
                'Variable / Field Name': variableName,
                'Form Name': form.designations[0].designation,
                'Section Header': '',
                'Field Type': datatTypeToRedcapDataType[q.datatype],
                'Field Label': fieldLabel,
                'Choices, Calculations, OR Slider Labels': (q.datatype === 'Value List' && q.answers || [])
                    .map(a => a.permissibleValue + ',' + a.valueMeaningName).join('|'),
                'Field Note': '',
                'Text Validation Type OR Show Slider Number': datatTypeToRedcapValidationType[q.datatype],
                'Text Validation Min': q.datatype === 'Number' && q.datatypeNumber ? q.datatypeNumber.minValue : '',
                'Text Validation Max': q.datatype === 'Number' && q.datatypeNumber ? q.datatypeNumber.maxValue : '',
                'Identifier?': '',
                'Branching Logic (Show field only if...)': _questionSkipLogic,
                'Required Field?': q.required,
                'Custom Alignment': '',
                'Question Number (surveys only)': '',
                'Matrix Group Name': '',
                'Matrix Ranking?': ''
            };
        }

        const instrumentJsonRows = [];
        let sectionIndex = 0;
        for (const formElement of form.formElements) {
            sectionIndex++;
            instrumentJsonRows.push(oneLayerFormconvertSectionToRow(formElement, sectionIndex));
            for (const fe of formElement.formElements) {
                instrumentJsonRows.push(oneLayerFormconvertQuestionToRow(fe as FormQuestion));
            }
        }
        return json2csvParser.parse(instrumentJsonRows);
    }
}
