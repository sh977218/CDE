import { PermissibleValue } from 'shared/models.model';
import { DatatypeContainer } from 'shared/de/dataElement.model';
import { FhirCoding, FhirQuantity } from 'shared/mapping/fhir/fhir.model';

declare function containerToItemType(container: DatatypeContainer): string;
declare function containerValueListToCoding(container: DatatypeContainer, value: string): FhirCoding;
declare function itemTypeToItemDatatype(type: string): string;
declare function permissibleValueToCoding(pv: PermissibleValue): FhirCoding;
declare function valueToQuantity(container: DatatypeContainer, value: string, comparator: string, uomIndex: number): FhirQuantity;
declare function valueToTypedValue(container: DatatypeContainer, type: string, value: string, comparator?: string, uomIndex?: number): any;
