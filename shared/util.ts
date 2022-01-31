import * as _cloneDeep from 'lodash/cloneDeep';

export function capCase(str: string): string {
    return str.split(' ').map(capitalize).join(' ');
}

// capitalize first letter only
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decamelize(str: string = '', sep: string = ' '): string {
    const outFormat = '$1' + sep + '$2';
    return str
        .replace(/([a-z\d])([A-Z])/g, outFormat)
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, outFormat)
        .toLowerCase();
}

export function deepCopy<T>(obj: T): T {
    return _cloneDeep(obj);
}

export function noop(...args: any[]): void {
}

export function stringCompare(a: string, b: string): number {
    return a > b ? 1 : (a < b ? -1 : 0);
}
