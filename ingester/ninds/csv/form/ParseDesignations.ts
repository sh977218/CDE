import { trim } from 'lodash';
import { convertFileNameToFormName } from 'ingester/ninds/csv/shared/utility';

export function parseDesignations(csvFileName: string) {
    const formName = convertFileNameToFormName(csvFileName);
    return [{designation: formName, tags: []}];
}

export function parseNhlbiDesignations(row) {
    const crfName = row.CrfName;
    return [{designation: trim(crfName), tags: []}];
}



