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

export function noop(...args: any[]): void {
}

export function ownKeys<T extends {}>(obj?: T): (keyof T)[] {
    return obj ? Object.keys(obj).filter(k => obj.hasOwnProperty(k)) as (keyof T)[] : [];
}

export function stringCompare(a: string, b: string): number {
    return a > b ? 1 : (a < b ? -1 : 0);
}
