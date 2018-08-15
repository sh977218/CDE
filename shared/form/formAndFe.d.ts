import { CdeId, supportedFhirResources } from 'shared/models.model';
import { CdeForm, FormElement } from 'shared/form/form.model';

declare function getFhirResourceMap(f: CdeForm|FormElement): any;
declare function getIds(f: CdeForm|FormElement): CdeId[]|undefined;
declare function getMapToFhirResource(f: CdeForm|FormElement): supportedFhirResources|undefined;
declare function getTinyId(f: CdeForm|FormElement): string|undefined;
declare function isForm(f: CdeForm|FormElement): boolean;
declare function isMappedTo(f: CdeForm|FormElement, systemOrProtocol: string): boolean;
