import { codeSystemOut } from 'shared/mapping/fhir/fhirDatatypes';

export function newCoding(system = undefined, code = undefined, version = undefined, display = undefined) {
    return {
        code: code,
        display: display,
        system: codeSystemOut(system),
        userSelected: false,
        version: version,
    };
}
