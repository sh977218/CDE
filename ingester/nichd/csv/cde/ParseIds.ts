import { isEmpty } from 'lodash';

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
