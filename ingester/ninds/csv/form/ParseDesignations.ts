import { convertFileNameToFormName } from 'ingester/ninds/csv/loadNindsFormByCsv';

export function parseDesignations(csvFileName: string) {
    const formName = convertFileNameToFormName(csvFileName);
    return [{designation: formName, tags: []}];
}

