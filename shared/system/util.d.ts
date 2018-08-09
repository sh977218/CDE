import { Elt } from 'shared/models.model';

declare function capString(s: string): string;
declare function deepCopy<T>(obj: T): T;
declare function reduceOptionalArray<T, U>(arr: U[], cb: (a: T, c: U) => T, initialValue: T);
