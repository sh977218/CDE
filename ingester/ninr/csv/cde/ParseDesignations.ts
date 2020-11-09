import { parseDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';
import { CdeForm } from 'shared/form/form.model';
import { isEqual, uniq, uniqWith } from 'lodash';

export function parseNinrDesignations(ninrRow: any) {
    return parseDesignations(ninrRow);
}

export function mergeNinrDesignations(existingCdeObj: CdeForm,
                                      newCdeObj: CdeForm,
                                      otherSourceRawArtifacts: CdeForm[] = []) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue.designations);
    };
    const allDesignations = newCdeObj.designations.concat(otherSourceRawArtifacts.reduce(reducer, []));
    existingCdeObj.designations = uniqWith(allDesignations, (a, b) => {
        if (isEqual(a.designation, b.designation)) {
            a.tags = uniq(a.tags.concat(b.tags));
            return true;
        } else {
            return false;
        }
    });
}

