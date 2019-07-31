import { isEqual, isEmpty } from 'lodash';

export function parseDefinitions(protocol) {
    const definitions = [];
    const description = protocol.description;
    const definition = protocol.definition;

    if (isEqual(description, definition)) {
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

    return definitions;
}
