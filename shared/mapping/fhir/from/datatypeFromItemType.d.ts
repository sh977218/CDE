import { DatatypeContainer } from 'shared/de/dataElement.model';
import { FhirCoding, FhirElement, FhirQuantity } from 'shared/mapping/fhir/fhir.model';

declare function isCodingToValueList(container: DatatypeContainer, coding: FhirCoding): boolean;
declare function isItemTypeToContainer(container: DatatypeContainer, type: string): boolean;
declare function quantityToUnitsOfMeasure(container: DatatypeContainer, quantity: FhirQuantity): boolean;
declare function typedValueToValue(container: DatatypeContainer, type: string, value: string | number | boolean | FhirCoding | FhirQuantity | undefined): boolean;
declare function valuedElementToItemType(elem: FhirElement): string;
