import { capCase } from 'shared/util';

// used for types with known parameters, technically string is more correct because any property can be added at run-time
export const keys = Object.keys as <T>(obj: T) => Array<keyof T>;
