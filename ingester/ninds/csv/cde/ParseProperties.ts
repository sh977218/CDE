import { isEmpty } from 'lodash';
import { sortProperties } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';


export function parseProperties(row) {
    const properties = [];
    const keywords = getCell(row, 'Keywords');
    if (!isEmpty(keywords)) {
        properties.push({key: 'Keywords', value: keywords, source: 'NINDS'});
    }
    const guidelinesInstructions = getCell(row, 'Guidelines/Instructions');
    if (!isEmpty(guidelinesInstructions)) {
        properties.push({key: 'Guidelines/Instructions', value: guidelinesInstructions, source: 'NINDS'});
    }
    const notes = getCell(row, 'Notes');
    if (!isEmpty(notes)) {
        properties.push({key: 'Notes', value: notes, source: 'NINDS'});
    }

    return sortProperties(properties);
}
