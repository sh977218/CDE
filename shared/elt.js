import { capString } from 'shared/system/util';

export function getName(elt) {
    if (elt.primaryNameCopy) {
        return elt.primaryNameCopy;
    } else {
        return elt.designations[0].designation;
    }
}
