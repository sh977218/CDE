import { convertFileNameToFormName } from 'ingester/ninds/csv/shared/utility';

export function parseDesignations(csvFileName: string) {
    const formName = convertFileNameToFormName(csvFileName);
    return [{designation: formName, tags: []}];
}

