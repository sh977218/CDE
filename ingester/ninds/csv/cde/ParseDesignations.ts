import { isEmpty, isEqual, trim, uniq } from 'lodash';
import { getCell } from 'ingester/ninds/csv/shared/utility';


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

function parsePreferredQuestionText(pqt) {
    return uniq(pqt.split('-----').map(t => trim(t.split(':')[1])));
}

export function parseNhlbiDesignations(row: any) {
    const title = getCell(row, 'Title');
    const preferredQuestionTextString = getCell(row, 'Suggested Question Text');
    const preferredQuestionTexts = parsePreferredQuestionText(preferredQuestionTextString);

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
