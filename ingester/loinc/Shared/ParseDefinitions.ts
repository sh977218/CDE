import { isEmpty } from 'lodash';

export function parseDefinitions(loinc) {
    const definitions = [];
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)'].forEach(t => {
            if (!isEmpty(t.definition)) {
                definitions.push({
                    definition: t.definition.trim(),
                    tags: ['TERM DEFINITION/DESCRIPTION(S)']
                });
            }
        });
    }

    return definitions;
}