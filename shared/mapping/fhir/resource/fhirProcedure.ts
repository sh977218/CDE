import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { FhirEncounter, FhirPatient, FhirProcedure } from 'shared/mapping/fhir/fhirResource.model';

export function newProcedure(patient: FhirPatient, encounter?: FhirEncounter): FhirProcedure {
    return {
        resourceType: 'Procedure',
        bodySite: undefined,
        category: undefined,
        code: undefined,
        complication: undefined,
        context: encounter ? toRef(encounter) : undefined,
        id: undefined,
        note: undefined,
        outcome: undefined,
        performedPeriod: encounter ? encounter.period : undefined,
        status: 'completed',
        subject: toRef(patient),
        usedCode: undefined,
    };
}
