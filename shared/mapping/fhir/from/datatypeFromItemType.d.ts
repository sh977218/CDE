import { DatatypeContainer } from 'shared/de/dataElement.model';
import { FhirCoding, FhirElement, FhirQuantity, FhirValue } from 'shared/mapping/fhir/fhir.model';
import { Question } from 'shared/form/form.model';

declare function isCodingToValueList(container: DatatypeContainer, coding: FhirCoding): boolean;
declare function isItemTypeToContainer(container: DatatypeContainer, type: string): boolean;
declare function quantityToUnitsOfMeasure(container: DatatypeContainer, quantity: FhirQuantity): boolean;
declare function typedValueToValue(container: Question, type: string, value: FhirValue): boolean;
declare function valuedElementToItemType(elem: FhirElement): string;
