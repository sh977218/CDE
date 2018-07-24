import { CdeForm, FormElement } from 'shared/form/form.model';

declare function getMapToFhirResource(elt: CdeForm|FormElement): string|undefined;
declare function isMappedTo(f: CdeForm|FormElement, systemOrProtocol: string): boolean;
