import {find, isEmpty, uniq} from 'lodash';

export function parseDefinitions(loinc) {
    const definitions: any[] = [];
    const termDescription = loinc['Term Description'] || loinc['Term Descriptions'];
    if (!isEmpty(termDescription)) {
        termDescription.forEach(t => {
            const text = t.text;
            const existingTermDescription = find(definitions, {definition: text});
            if (existingTermDescription) {
                if (!existingTermDescription.tags) {
                    existingTermDescription.tags = [];
                }
                const allTags = existingTermDescription.tags.concat(t.cite);
                existingTermDescription.tags = uniq(allTags);
            } else {
                definitions.push({definition: text, tags: [t.cite]});
            }
        });
    }
    return definitions;
}
