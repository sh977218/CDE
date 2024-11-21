import { parseProperties } from 'ingester/ninds/csv/cde/ParseProperties';
import { CdeForm } from 'shared/form/form.model';
import { uniqBy } from 'lodash';

export function parseNinrProperties(ninrRow) {
    return parseProperties(ninrRow);
}

export function mergeNinrProperties(
    existingCdeObj: CdeForm,
    newCdeObj: CdeForm,
    otherSourceRawArtifacts: CdeForm[] = []
) {
    const reducer = (accumulator, currentValue) => {
        return accumulator.concat(currentValue.properties);
    };
    const allProperties = newCdeObj.properties.concat(otherSourceRawArtifacts.reduce(reducer, []));
    existingCdeObj.properties = uniqBy(allProperties, 'key');
}
