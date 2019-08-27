export function parseDefinitions(protocol) {
    let definitions = [];
    let Description = protocol['Description of Protocol'];
    if (Description) {
        definitions.push({
            definition: Description.trim(),
            tags: []
        });
    }
    return definitions;
}