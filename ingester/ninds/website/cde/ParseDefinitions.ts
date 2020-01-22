import { uniq } from 'lodash';

export function parseDefinitions(nindsForms) {
    const definitionDescriptionArray = [];
    const shortDefinitionDescriptionArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.Definition) {
                definitionDescriptionArray.push(nindsCde.Definition);
            }
            if (nindsCde['Short Description']) {
                shortDefinitionDescriptionArray.push(nindsCde['Short Description']);
            }
        });
    });

    const _definitionDescriptionArray = uniq(definitionDescriptionArray);
    const _shortDefinitionDescriptionArray = uniq(shortDefinitionDescriptionArray);

    const definitions = [];
    _definitionDescriptionArray.forEach(n => {
        definitions.push({
            definition: n,
            tags: []
        });
    });
    return definitions;
}
