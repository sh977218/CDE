import {trim, uniq} from 'lodash';
import {sortDesignations} from 'ingester/shared/utility';

export function parseDesignations(nindsForms: any[]) {
    const formNameArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formName) {
            formNameArray.push(nindsForm.formName);
        }
    });

    const _formNameArray: string[] = uniq(formNameArray);
    if (_formNameArray.length !== 1) {
        console.log(nindsForms[0].formId + ' _formNameArray not good' + nindsForms[0].formId);
        process.exit(1);
    }
    const designations: any[] = [];

    _formNameArray.forEach(c => {
        designations.push({
            designation: trim(c),
            tags: []
        });
    });
    return sortDesignations(designations);
}
