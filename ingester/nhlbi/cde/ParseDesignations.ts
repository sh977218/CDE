import { isEqual } from 'lodash';
import { getCell } from 'ingester/nhlbi/shared/utility';

export function parseNhlbiDesignations(row: any) {
    const title = getCell(row, 'Data Element Name');
    const preferredQuestionText = getCell(row, 'Suggested Question Text');
    const designations = [];
    if (isEqual(title, preferredQuestionText)) {
        designations.push({
            designation: title,
            tags: ['Suggested Question Text'],
        });
    } else {
        designations.push({
            designation: title,
            tags: [],
        });
        designations.push({
            designation: preferredQuestionText,
            tags: ['Suggested Question Text'],
        });
    }
    return designations;
}
