import { PermissibleValue } from 'shared/models.model';

export function pvGetDisplayValue(pv: PermissibleValue): string {
    return pv && pv.permissibleValue !== pv.valueMeaningName ? pv.permissibleValue : '';
}

export function pvGetLabel(pv?: PermissibleValue): string {
    return pv ? pv.valueMeaningName || pv.permissibleValue : '';
}
