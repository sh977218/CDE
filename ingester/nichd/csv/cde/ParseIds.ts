import { isEmpty, trim } from 'lodash';

export function parseNichdIds(row: any) {
    const ids = [];
    const variableName = row['Variable / Field Name'];
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'NICHD Variable Name',
            id: variableName
        });
    }
    return ids;
}

export function addNichdIdentifier(cde, row: any) {
    const variableName = trim(row['Variable / Field Name']);
    if (!isEmpty(variableName)) {
        let found = false;
        cde.ids.forEach(d => {
            if (d.id === variableName) {
                found = true;
            }
        });
        if (!found) {
            cde.ids.push({
                source: 'NICHD Variable Name',
                id: variableName
            });
        }
    }
}
