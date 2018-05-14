import { capString } from 'shared/system/util';

export function getPatientName(patient) {
    if (!patient) {
        return '';
    }
    let name = patient.name.filter(name => name.use === 'official')[0];
    if (!name) name = patient.name[0];
    return name.family + ', ' + name.given.join(' ');
}
