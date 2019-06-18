import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';

export function newProcedure(encounter = undefined, patient = undefined) {
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
        subject: patient ? toRef(patient) : undefined,
        usedCode: undefined,
        userReference: undefined,
    };
}
