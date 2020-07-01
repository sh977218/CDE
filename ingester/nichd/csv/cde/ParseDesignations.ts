import { isEmpty } from 'lodash';

export function parseNichdDesignations(row) {
    const designations = [];
    const fieldLabel = row['Field Label'];
    if (!isEmpty(fieldLabel)) {
        designations.push({
            designation: row['Field Label'],
            tags: ['Preferred Question Text']
        });
    }
    return designations;
}
