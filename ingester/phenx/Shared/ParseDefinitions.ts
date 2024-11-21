import {isEmpty, isEqual, sortBy, toLower, trim} from 'lodash';

export function parseDefinitions(protocol) {
    const definitions: any[] = [];
    const description = trim(protocol.description);
    const definition = trim(protocol.definition);

    if (isEqual(toLower(description), toLower(definition))) {
        if (!isEmpty(description)) {
            definitions.push({
                definition: description.trim(),
                tags: []
            });
        }
    } else {
        if (!isEmpty(description)) {
            definitions.push({
                definition: description.trim(),
                tags: []
            });
        }
        if (!isEmpty(definition)) {
            definitions.push({
                definition: definition.trim(),
                tags: []
            });
        }
    }
    return sortBy(definitions, ['definition']);

}
