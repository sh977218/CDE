import { isEmpty } from 'lodash';

export function parseProperties(row) {
    let properties = [];
    let fieldNote = row['Field Note'];
    if (!isEmpty(fieldNote)) {
        properties.push({
            source: 'PhenX',
            key: 'Field Note',
            value: fieldNote.trim()
        })
    }

    return properties;
}