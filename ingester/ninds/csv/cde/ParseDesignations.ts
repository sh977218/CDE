import {isEmpty, isEqual, trim, uniq, uniqBy} from 'lodash';
import {getCell} from 'ingester/ninds/csv/shared/utility';


export function parseDesignations(row: any) {
    const designations = [];
    const title = getCell(row, 'Title');
    const preferredQuestionText = getCell(row, 'Preferred Question Text');

    if (isEqual(title, preferredQuestionText)) {
        designations.push({
            designation: title,
            tags: ['Preferred Question Text']
        });
    } else {
        if (!isEmpty(title)) {
            designations.push({
                designation: title,
                tags: []
            });
        }
        if (!isEmpty(preferredQuestionText)) {
            designations.push({
                designation: preferredQuestionText,
                tags: ['Preferred Question Text']
            });
        }
    }
    return designations;
}

export function parseFormId(str) {
    const regExp = /\(([^)]+)\)/;
    const matches = regExp.exec(str);
    return matches[1];
}


function parsePreferredQuestionText(pqt, nindsId, formMap, row) {
    return uniq(pqt.split('-----').map(t => {
        const tArray = t.split(':');
        const formInfo = trim(tArray[0]);
        const formId = parseFormId(formInfo);
        if (isEmpty(formMap[formId])) {
            formMap[formId] = [row];
        } else {
            const rows = formMap[formId];
            rows.push(row);
            formMap[formId] = uniqBy(rows, 'name');
        }
        const preferredQuestionText = trim(tArray[1]);
        return preferredQuestionText;
    }));
}

export function parseNhlbiDesignations(row: any, formMap) {
    const title = getCell(row, 'Title');
    const preferredQuestionTextString = getCell(row, 'Suggested Question Text');
    const externalNindsId = getCell(row, 'External ID.NINDS');
    const preferredQuestionTexts = parsePreferredQuestionText(preferredQuestionTextString, externalNindsId, formMap, row);

    const designations = uniq(preferredQuestionTexts.concat(title)).map(t => {
        if (isEqual(title, t)) {
            return {
                designation: t,
                tags: ['Preferred Question Text']
            };
        } else {
            return {
                designation: t,
                tags: []
            };
        }
    });
    return designations;
}
