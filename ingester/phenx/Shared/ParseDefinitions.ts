import { isEmpty, isEqual, toLower, trim } from 'lodash';

export function parseDefinitions(protocol) {
    const definitions = [];
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

    return definitions;
}
