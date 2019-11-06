import { uniq } from 'lodash';

export function parseCopyright(nindsForms: any[]) {
    const formNameArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formName) {
            formNameArray.push(nindsForm.formName);
        }
    });

    const _formNameArray = uniq(formNameArray);
    if (_formNameArray.length !== 1) {
        console.log(nindsForms[0].formId + ' _formNameArray not good');
        process.exit(1);
    }
    const copyright = _formNameArray[0].indexOf('©') !== -1;
    return copyright;
}
