import { capCase } from 'shared/system/util';

export const keys = Object.keys as <T>(obj: T) => Array<keyof T>;
