import { uniq, uniqWith } from 'lodash';

export function mergeDefinitions(existingDefinitions, newDefinitions) {
    let allDefinitions = existingDefinitions.concat(newDefinitions);
    return uniqWith(allDefinitions, (a: any, b: any) => {
        if (a.definition === b.definition && a.definitionFormat === b.definitionFormat) {
            a.tags = uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });
}