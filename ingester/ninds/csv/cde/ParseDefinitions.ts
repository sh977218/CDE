import { isEmpty, isEqual } from 'lodash';
import { getCell } from 'ingester/ninds/csv/cde/cde';

export function parseDefinitions(row) {
    const definitions = [];
    const shortDescription = getCell(row, 'Short Description');
    const description = getCell(row, 'Definition');
    if (isEqual(shortDescription, description)) {
        definitions.push({
            definition: description,
            tags: []
        });
    } else {
        if (!isEmpty(description)) {
            definitions.push({
                definition: description,
                tags: []
            });
        }
        if (!isEmpty(shortDescription)) {
            definitions.push({
                definition: shortDescription,
                tags: []
            });
        }

    }
    return definitions;
}
