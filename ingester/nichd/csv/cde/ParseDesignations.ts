import { isEmpty, trim, uniq } from 'lodash';

export function parseNichdDesignations(row) {
    const designations = [];
    const fieldLabel = trim(row['Field Label']);
    if (!isEmpty(fieldLabel)) {
        designations.push({
            designation: fieldLabel,
            tags: ['NBSTRN Krabbe disease']
        });
    }
    return designations;
}

export function addNichdDesignation(cde, row) {
    const fieldLabel = trim(row['Field Label']);
    if (!isEmpty(fieldLabel)) {
        let found = false;
        cde.designations.forEach(d => {
            if (d.designation === fieldLabel) {
                found = true;
                d.tags = uniq(d.tags.concat('NBSTRN Krabbe disease'));
            }
        });
        if (!found) {
            cde.designations.push({
                designation: fieldLabel,
                tags: ['NBSTRN Krabbe disease']
            });
        }
    }
}
