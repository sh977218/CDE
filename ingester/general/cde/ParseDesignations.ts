import { isEqual, trim } from 'lodash';
import { getCell } from 'shared/loader/utilities/utility';

export function parseDesignations(row: any) {
    let title = getCell(row, 'naming.designation');
    title = title.split('-')[1] ? trim(title.split('-')[1]) : title;
    const questionText = getCell(row, 'Preferred Question Text');
    const designations = [];
    if (isEqual(title, questionText)) {
        designations.push({
            designation: title,
            tags: ['Preferred Question Text'],
        });
    } else {
        designations.push({
            designation: title,
            tags: [],
        });
        designations.push({
            designation: questionText,
            tags: ['Preferred Question Text'],
        });
    }
    return designations;
}
