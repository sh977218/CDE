import { capCase } from 'shared/util';

export const keys = Object.keys as <T>(obj: T) => Array<keyof T>;
