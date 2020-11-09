import { uniq } from 'lodash';
import { sortIds } from 'ingester/shared/utility';

export function parseIds(nindsForms: any[]) {
    const formIdArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formId) {
            formIdArray.push(nindsForm.formId.replace('form', '').trim());
        }
    });
    const formId = uniq(formIdArray);
    const ids: any[] = [];

    formId.forEach(i => {
        ids.push({
            source: 'NINDS',
            id: i
        });
    });
    return sortIds(ids, 'NINDS');
}
