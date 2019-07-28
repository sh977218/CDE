import { isEmpty } from 'lodash';

export function parseIds(row, newForm) {
    const ids = [];
    const variableName = row['Variable / Field Name'];
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'PhenX Variable',
            id: newForm.ids[0].id + '_' + variableName.trim()
        });
    }

    return ids;
}
