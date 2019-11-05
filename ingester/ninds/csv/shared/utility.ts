import { isEmpty, trim, lowerCase, forEach, words, capitalize, join, isEqual } from 'lodash';
import { loopFormElements, mergeClassificationByOrg } from 'ingester/shared/utility';

const STOP_WORDS = ['the', 'of', 'a'];

function capitalizeWord(str: string) {
    return STOP_WORDS.indexOf(str) === -1 ? capitalize(str) : str;
}

function notEmptyWord(str: string) {
    return !isEmpty(str);
}

function capitalizeBySpace(str: string) {
    const wordsSpitSpace = words(str, /[^\s]+/g);
    const wordsSpitSpaceCapitalize = wordsSpitSpace.filter(notEmptyWord).map(capitalizeWord);
    const joinKeySpace = join(wordsSpitSpaceCapitalize, ' ');
    return trim(joinKeySpace);
}

function capitalizeByDot(str: string) {
    const wordsSpitSpace = words(str, /[^.]+/g);
    const wordsSpitSpaceCapitalize = wordsSpitSpace.filter(notEmptyWord).map(capitalizeWord);
    const joinKeySpace = join(wordsSpitSpaceCapitalize, '.');
    return trim(joinKeySpace);
}

function capitalizeBySlash(str: string) {
    const wordsSpitSpace = words(str, /[^/]+/g);
    const wordsSpitSpaceCapitalize = wordsSpitSpace.filter(notEmptyWord).map(capitalizeWord);
    const joinKeySpace = join(wordsSpitSpaceCapitalize, '/');
    return trim(joinKeySpace);
}

function capitalizeByLeftParentheses(str: string) {
    const wordsSpitSpace = words(str, /[^(]+/g);
    const wordsSpitSpaceCapitalize = wordsSpitSpace.filter(notEmptyWord).map(capitalizeWord);
    const joinKeySpace = join(wordsSpitSpaceCapitalize, '(');
    return trim(joinKeySpace);
}

function capitalizeByRightParentheses(str: string) {
    const wordsSpitSpace = words(str, /[^)]+/g);
    const wordsSpitSpaceCapitalize = wordsSpitSpace.filter(notEmptyWord).map(capitalizeWord);
    const joinKeySpace = join(wordsSpitSpaceCapitalize, ')');
    return trim(joinKeySpace);
}

function formatKey(key: string) {
    // reconstruct the key
    /*
        const dotFormat = capitalizeByDot(key);
        const slashFormat = capitalizeBySlash(dotFormat);
        const leftParenthesesFormat = capitalizeByLeftParentheses(slashFormat);
        const rightParenthesesFormat = capitalizeByRightParentheses(leftParenthesesFormat);
        const spaceFormat = capitalizeBySpace(rightParenthesesFormat);
        const spaceFormat = capitalizeBySpace(key);
        return trim(spaceFormat);
    */
    return trim(key.toLowerCase());
}

export function getCell(row: any, header: string) {
    const key = formatKey(header);
    const value = row[key];
    if (!isEmpty(value)) {
        return trim(value);
    } else {
        return '';
    }
}

export function formatRows(csvFileName: string, rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach((row, i) => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!isEmpty(formattedP)) {
                    formattedRow[formattedP] = trim(row[p]);
                }
            }
        }

        const variableName = getCell(formattedRow, 'variable name');
        const title = getCell(formattedRow, 'title');
        if (isEmpty(variableName)) {
            console.log(`${csvFileName} has empty variablename. row: ${i}`);
            process.exit(1);
        }
        if (isEmpty(title)) {
            console.log(`${csvFileName} has empty title. row: ${i}`);
            process.exit(1);
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function removePreclinicalClassification(elt: any) {
    elt.classification.forEach((c: any) => {
        if (c.stewardOrg.name === 'NINDS') {
            c.elements = c.elements.filter((e: any) => !isEqual(e.name, 'Preclinical TBI'));
        }
    });
}

export function changeNindsPreclinicalNeiClassification(existingElt: any, newObj: any, classificationOrgName: string) {
    const existingObj = existingElt.toObject();
    mergeClassificationByOrg(existingObj, newObj, classificationOrgName);
    existingElt.classification = existingObj.classification;
    removePreclinicalClassification(existingElt);
}

export function fixReferenceDocuments(existingElt: any) {
    const eltToFix = existingElt.toObject();
    forEach(eltToFix.referenceDocuments, refDoc => {
        refDoc.languageCode = 'en-us';
        refDoc.docType = 'text';
    });
    existingElt.referenceDocuments = eltToFix.referenceDocuments;
}

export function fixDefinitions(existingElt: any) {
    const eltToFix = existingElt.toObject();
    forEach(eltToFix.definitions, d => {
        d.definition = trim(d.definition);
        d.tags = d.tags.filter((t: string) => !isEqual(t, 'Preferred Question Text'));
    });
    existingElt.definitions = eltToFix.definitions;
}

function fixInstructions(fe: any) {
    if (fe.instructions) {
        const trimValueFormat = trim(fe.instructions.valueFormat);
        const instructions: any = {
            value: fe.instructions
        };
        if (trimValueFormat) {
            instructions.valueFormat = trimValueFormat;
            fe.instructions = instructions;
        }
    } else {
        delete fe.instructions;
    }
}

export function fixFormElements(existingForm: any) {
    const formToFix: any = existingForm.toObject();
    loopFormElements(formToFix.formElements, {
        onQuestion: (fe: any) => {
            fixInstructions(fe);
        },
        onSection: (fe: any) => {
            fixInstructions(fe);
        },
        onForm: (fe: any) => {
            fixInstructions(fe);
        },
    });
    existingForm.formElements = formToFix.formElements;
}
