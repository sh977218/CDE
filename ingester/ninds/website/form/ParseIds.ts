import { uniq } from 'lodash';

export function parseIds(nindsForms: any[]) {
    const formIdArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formId) {
            formIdArray.push(nindsForm.formId.replace('form', '').trim());
        }
    });
    const formId = uniq(formIdArray);
    if (formId.length !== 1) {
        console.log(nindsForms[0].formId + ' formId not good');
        process.exit(1);
    }
    const ids: any[] = [];

    formId.forEach(i => {
        ids.push({
            source: 'NINDS',
            id: i
        });
    });
    return ids;
}
