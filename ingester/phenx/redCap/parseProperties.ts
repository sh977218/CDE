export function parseProperties(row) {
    let properties = [];
    let fieldNote = row['Field Note'];
    if (fieldNote) fieldNote = fieldNote.trim();
    if (fieldNote) {
        properties.push({
            source: 'PhenX',
            key: 'Field Note',
            value: fieldNote
        })
    }

    return properties;
}
