import { FormQuestion } from 'shared/form/form.model';
import { FhirValue } from 'shared/mapping/fhir/fhir.model';

declare function questionToFhirValue(q: FormQuestion, fhirObj: FhirValue, fhirMulti?: boolean, prefix?: string,  hasCodeableConcept?: boolean): void;
declare function storeTypedValue(value: any, obj: FhirValue, qType: string, prefix?: string, hasCodeableConcept?: boolean): void;
