import { DataElement, ValueDomain } from 'shared/de/dataElement.model';

declare function checkPvUnicity(valueDomain: ValueDomain): {allValid: boolean, pvNotValidMsg: string};
declare function fixDatatype(elt): void;
declare function wipeDatatype(elt: DataElement): void;
