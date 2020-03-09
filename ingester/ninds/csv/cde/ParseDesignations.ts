import { isEmpty, isEqual } from 'lodash';
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

export function parseNhlbiDesignations(row: any) {
    const designations = [];
    const title = getCell(row, 'Title');
    const preferredQuestionText = getCell(row, 'Suggested Question Text');

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
