import { uniq, uniqWith } from 'lodash';

export function mergeDesignations(existingDesignations, newDesignations) {
    let allDesignations = existingDesignations.concat(newDesignations);
    return uniqWith(allDesignations, (a: any, b: any) => {
        if (a.designation === b.designation) {
            a.tags = uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });
}