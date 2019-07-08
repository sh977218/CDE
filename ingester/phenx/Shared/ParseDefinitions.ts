export function parseDefinitions(protocol) {
    let definitions = [];
    let description = protocol.description;
    let definition = protocol.definition;

    if (description === definition) {
        definitions.push({
            definition: description.trim(),
            tags: []
        });
    } else {
        definitions.push({
            definition: description.trim(),
            tags: []
        });
        definitions.push({
            definition: definition.trim(),
            tags: []
        });
    }

    return definitions;
}