import { PermissibleValue } from 'shared/models.model';

export function umlsPvFilter(pv: PermissibleValue): boolean {
    return !!pv.codeSystemName && !!pv.valueMeaningCode;
}
