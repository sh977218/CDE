import { DataElement, DatatypeContainer, ValueDomain } from 'shared/de/dataElement.model';

declare function checkPvUnicity(valueDomain: ValueDomain): {allValid: boolean, message: string};
declare function checkDefinitions(elt: DataElement): {allValid: boolean, message: string};
declare function fixDatatype(dc: DatatypeContainer): void;
declare function fixDataElement(elt: DataElement): void;
declare function wipeDatatype(elt: DataElement): void;
