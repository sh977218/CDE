import { CodeAndSystem, PermissibleValue } from 'shared/models.model';
import { DatatypeContainer } from 'shared/de/dataElement.model';
import { FormQuestion } from 'shared/form/form.model';
import { FhirCoding, FhirQuantity, FhirValue } from 'shared/mapping/fhir/fhir.model';

declare function containerToItemType(container: DatatypeContainer): string;
declare function containerValueListToCoding(container: DatatypeContainer, value: string, multi?: boolean): FhirCoding;
declare function itemTypeToItemDatatype(type: string, hasCodeableConcept?: boolean): string;
declare function permissibleValueToCoding(pv: PermissibleValue): FhirCoding;
declare function questionToFhirValue(q: FormQuestion, fhirObj: FhirValue, fhirMulti?: boolean, prefix?: string,  hasCodeableConcept?: boolean): void;
declare function storeTypedValue(value: any, obj: FhirValue, qType: string, prefix?: string, hasCodeableConcept?: boolean): void;
declare function valueToQuantity(container: DatatypeContainer, value: string, comparator: string, valueUom: CodeAndSystem): FhirQuantity;
declare function valueToTypedValue(container: DatatypeContainer, type: string, value: string, comparator?: string, valueUom?: CodeAndSystem, hasCodeableConcept?: boolean): any;
