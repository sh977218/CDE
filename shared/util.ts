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

export function filterClassificationPerUser(elt, userOrgs) {
    elt.classification = elt.classification.filter(c => userOrgs.indexOf(c.stewardOrg.name) !== -1);
}

export function deepCopyElt(elt) {
    const eltCopy = copyDeep(elt);
    eltCopy.registrationState.administrativeNote = 'Copy of: ' + elt.tinyId;
    delete (eltCopy as any).tinyId;
    delete eltCopy._id;
    delete eltCopy.origin;
    delete eltCopy.created;
    delete eltCopy.updated;
    delete eltCopy.imported;
    delete eltCopy.updatedBy;
    delete eltCopy.createdBy;
    delete eltCopy.version;
    delete (eltCopy as any).history;
    delete eltCopy.changeNote;
    delete (eltCopy as any).comments;
    eltCopy.ids = [];
    eltCopy.sources = [];
    eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
    eltCopy.registrationState = {
        administrativeNote: 'Copy of: ' + elt.tinyId,
        registrationStatus: 'Incomplete',
    };
    return eltCopy;
}
