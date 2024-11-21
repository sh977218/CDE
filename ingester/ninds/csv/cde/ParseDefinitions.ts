import {isEmpty, isEqual} from 'lodash';
import {getCell} from 'ingester/ninds/csv/shared/utility';

export function parseDefinitions(row: any) {
    const definitions = [];
    const shortDescription = getCell(row, 'Short Description');
    const description = getCell(row, 'Definition');
    if (isEqual(shortDescription, description)) {
        definitions.push({
            definition: description,
            tags: ['Short Description', 'Definition']
        });
    } else {
        if (!isEmpty(description)) {
            definitions.push({
                definition: description,
                tags: ['Definition']
            });
        }
        if (!isEmpty(shortDescription)) {
            definitions.push({
                definition: shortDescription,
                tags: ['Short Description']
            });
        }

    }
    return definitions;
}

export function parseNhlbiDefinitions(row: any) {
    const definitions = [];
    const shortDescription = getCell(row, 'Short Description');
    const description = getCell(row, 'Description');
    if (isEqual(shortDescription, description)) {
        definitions.push({
            definition: description,
            tags: ['Short Description', 'Description']
        });
    } else {
        if (!isEmpty(description)) {
            definitions.push({
                definition: description,
                tags: ['Description']
            });
        }
        if (!isEmpty(shortDescription)) {
            definitions.push({
                definition: shortDescription,
                tags: ['Short Description']
            });
        }

    }
    return definitions;
}
