import { trim } from 'lodash';

export function parseDesignations(formName: string) {
    return [{designation: trim(formName), tags: []}];
}



