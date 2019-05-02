import _find from 'lodash/find';

export function pvGetDisplayValue(pv) {
    return pv && pv.permissibleValue !== pv.valueMeaningName ? pv.permissibleValue : '';
}

export function pvGetLabel(pv) {
    return pv ? pv.valueMeaningName || pv.permissibleValue : '';
}
