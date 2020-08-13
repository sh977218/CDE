import { parseIds } from 'ingester/ninds/csv/cde/ParseIds';
import { uniqWith, isEqual } from 'lodash';

export function parseNinrIds(ninrRow) {
    return parseIds(ninrRow);
}

export function mergeNinrIds(existingCdeObj, newCdeObj) {
    const existingIds: any[] = existingCdeObj.ids;
    const newIds: any[] = newCdeObj.ids;
    return uniqWith(newIds.concat(existingIds),
        (a, b) => isEqual(a.source, b.source) && isEqual(a.id, b.id));
}
