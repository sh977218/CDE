import { CbRet, Elt } from 'shared/models.model';

declare function capString(s: string): string;
declare function deepCopy<T>(obj: T): T;
declare function partition<T>(array: T[], callback: CbRet<boolean, T, number, T[]>): [T[], T[]];
declare function push2<T>(array: T[], element: T): T[];
declare function reduceOptionalArray<T, U>(arr: U[], cb: (a: T, c: U) => T, initialValue: T): T;
declare function stringCompare(a: string, b: string): number;
