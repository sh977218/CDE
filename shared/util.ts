export function capCase(str: string): string {
    return str.split(' ').map(capitalize).join(' ');
}

// capitalize first letter only
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function copyDeep<T extends {}>(obj: T): T {
    /// #if env == 'NODE'
    return JSON.parse(JSON.stringify(obj)); // TODO: structuredClone() supported on NODE 17
    /// #elif env == 'BROWSER'
    // #code return (window as any).structuredClone(obj); // TODO: bug https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1237
    /// #else
    // #code throw new Error('Unimplemented');
    /// #endif
}

export function copyShallow<T extends {}>(obj: T, target: any = {}): T {
    return Object.assign(target, obj);
}

export function decamelize(str: string = '', sep: string = ' '): string {
    const outFormat = '$1' + sep + '$2';
    return str
        .replace(/([a-z\d])([A-Z])/g, outFormat)
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, outFormat)
        .toLowerCase();
}

function toS(obj: any) {
    return Object.prototype.toString.call(obj);
}
export function isDate(obj: any): obj is Date {
    return toS(obj) === '[object Date]';
}
export function isRegExp(obj: any): obj is RegExp {
    return toS(obj) === '[object RegExp]';
}
export function isError(obj: any): obj is Error {
    return toS(obj) === '[object Error]';
}
export function isBoolean(obj: any): obj is boolean {
    return toS(obj) === '[object Boolean]';
}
export function isNumber(obj: any): obj is number {
    return toS(obj) === '[object Number]';
}
export function isString(obj: any): obj is string {
    return toS(obj) === '[object String]';
}

export function isT<T>(t: T | null | undefined): t is T {
    return !!t;
}

export function noop(...args: any[]): void {}

export function ownKeys<T extends {}>(obj?: T): (keyof T)[] {
    return obj ? (Object.keys(obj).filter(k => obj.hasOwnProperty(k)) as (keyof T)[]) : [];
}

export function stringToArray<T extends string = string>(arrayString: string, delim = ';'): T[] {
    return arrayString ? (arrayString.split(delim) as T[]) : [];
}

export function stringCompare(a: string, b: string): number {
    return a > b ? 1 : a < b ? -1 : 0;
}
