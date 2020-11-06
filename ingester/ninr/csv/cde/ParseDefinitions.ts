import { parseDefinitions } from 'ingester/ninds/csv/cde/ParseDefinitions';
import { CdeForm } from 'shared/form/form.model';
import { isEqual, uniq, uniqWith } from 'lodash';

export function parseNinrDefinitions(ninrRow) {
    return parseDefinitions(ninrRow);
}

export function mergeNinrDefinitions(existingCdeObj: CdeForm,
                                     newCdeObj: CdeForm,
                                     otherSourceRawArtifacts: CdeForm[] = []) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue.definitions);
    };
    const allDefinitions = newCdeObj.definitions.concat(otherSourceRawArtifacts.reduce(reducer, []));
    existingCdeObj.definitions = uniqWith(allDefinitions, (a, b) => {
        if (isEqual(a.definition, b.definition)) {
            a.tags = uniq(a.tags.concat(b.tags));
            return true;
        } else {
            return false;
        }
    });
}
