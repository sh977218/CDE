import { FormElement } from 'shared/form/form.model';
import { FhirUri } from 'shared/mapping/fhir/fhir.model';

declare const externalCodeSystems: {id: string, uri: string}[];
declare const externalCodeSystemsMap: any;
declare function codeSystemIn(uri: FhirUri): string;
declare function codeSystemOut(system?: string, fe?: FormElement): string;
