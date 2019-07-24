import { isEmpty } from 'lodash';

export function parseIds(formId, row) {
    let ids = [];
    let variableName = row['Variable / Field Name'];
    if (variableName) variableName = variableName.trim();
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'PhenX Variable',
            id: formId + '_' + row['Variable / Field Name']
        })
    }

    return ids;
}