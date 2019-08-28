import { FhirPatient } from 'shared/mapping/fhir/fhirResource.model';
import { FhirHumanName } from 'shared/mapping/fhir/fhir.model';

export function getPatientName(patient: FhirPatient): string {
    if (!patient) {
        return '';
    }
    let name = patient.name.filter((name: FhirHumanName) => name.use === 'official')[0];
    if (!name) {
        name = patient.name[0];
    }
    return name.family + ', ' + name.given.join(' ');
}
