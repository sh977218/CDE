import {isEmpty} from 'lodash';

export function parseNinrDesignations(ninrFormName: string) {
    const designations = [];
    if (!isEmpty(ninrFormName)) {
        designations.push({
            designation: ninrFormName,
            tags: []
        });
    }
    return designations;
}
