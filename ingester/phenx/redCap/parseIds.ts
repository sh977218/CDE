export function parseIds(formId, row) {
    let ids = [];
    let variableName = row['Variable / Field Name'];
    if (variableName) variableName = variableName.trim();
    if (variableName) {
        ids.push({
            source: 'PhenX Variable',
            id: formId + '_' + row['Variable / Field Name']
        })
    }

    return ids;
}