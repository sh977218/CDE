import { CdeId } from 'shared/models.model';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';

declare function getFhirResourceMap(f: CdeForm|FormElement): any;
declare function getIds(f: CdeForm|FormElement): CdeId[]|undefined;
declare function getMapToFhirResource(f: CdeForm|FormElement): supportedFhirResources|undefined;
declare function getTinyId(f: CdeForm|FormElement): string|undefined;
declare function getVersion(f: CdeForm|FormElement): string|undefined;
declare function isForm(f: CdeForm|FormElement): f is CdeForm;
declare function isMappedTo(f: CdeForm|FormElement, systemOrProtocol: string): boolean;
