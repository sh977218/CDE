import { isEmpty, trim, uniq } from 'lodash';
import { NichdConfig } from 'ingester/nichd/shared/utility';

export function parseNichdDesignations(row: any, config: NichdConfig) {
    const designations = [];
    const fieldLabel = trim(row['Field Label']);
    if (!isEmpty(fieldLabel)) {
        designations.push({
            designation: fieldLabel,
            tags: [config.source]
        });
    }
    return designations;
}

export function addNichdDesignation(cde: any, row: any) {
    const fieldLabel = trim(row['Field Label']);
    if (!isEmpty(fieldLabel)) {
        let found = false;
        cde.designations.forEach((d: any) => {
            if (d.designation === fieldLabel) {
                found = true;
                d.tags = uniq(d.tags.concat());
            }
        });
        if (!found) {
            cde.designations.push({
                designation: fieldLabel,
                tags: []
            });
        }
    }
}
