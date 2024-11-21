import {parseIds} from 'ingester/ninds/csv/cde/ParseIds';
import {isEqual, uniqWith} from 'lodash';
import {CdeForm} from 'shared/form/form.model';

export function parseNinrIds(ninrRow) {
    return parseIds(ninrRow);
}

export function mergeNinrIds(existingCdeObj: CdeForm,
                             newCdeObj: CdeForm,
                             otherSourceRawArtifacts: CdeForm[] = []) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue.ids);
    };
    const allIds = newCdeObj.ids.concat(otherSourceRawArtifacts.reduce(reducer, []));
    existingCdeObj.ids = uniqWith(allIds, (a, b) => isEqual(a.source, b.source) && isEqual(a.id, b.id));
}
