import { convertFileNameToFormName } from 'ingester/ninds/csv/shared/utility';
import { createNindsForm } from 'ingester/ninds/csv/form/form';
import { loadNindsForm } from 'ingester/ninds/shared';

export async function loadFormByCsv(csvFileName: string, rows: any[]) {
    const formName = convertFileNameToFormName(csvFileName);
    const nindsForm = await createNindsForm(formName, csvFileName, rows);
    const cond = {
        archived: false,
        'designations.designation': formName
    };
    await loadNindsForm(nindsForm, cond, 'NINDS Preclinical NEI');
}


