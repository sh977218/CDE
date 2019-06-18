import { newPeriod } from 'shared/mapping/fhir/datatype/fhirPeriod';
import { newReference } from 'shared/mapping/fhir/datatype/fhirReference';

export function newEncounter(date, subject, serviceProvider) {
    return {
        resourceType: 'Encounter',
        id: undefined,
        status: 'finished',
        class: {'code': 'outpatient'},
        type: [{'coding': [{'system': 'http://snomed.info/sct', 'code': '185349003'}], 'text': 'Outpatient Encounter'}],
        period: newPeriod(date),
        serviceProvider: serviceProvider ? newReference(serviceProvider) : undefined,
        subject: subject ? newReference(subject) : undefined
    };
}
