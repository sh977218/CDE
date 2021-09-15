import * as _isEqual from 'lodash/isEqual';
import * as _union from 'lodash/union';

export function capCase(str: string): string {
    return str.split(' ').map(capString).join(' ');
}

// capitalize first letter only
export function capString(str: string): string {
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
    return JSON.parse(JSON.stringify(obj));
}

export function stringCompare(a: string, b: string): number {
    return a > b ? 1 : (a < b ? -1 : 0);
}

export function updateTag<T>(array: T[] | undefined, status: boolean, tag: T): T[] {
    if (!array) {
        array = [];
    }
    if (status) {
        if (!array.includes(tag)) {
            array.push(tag);
        }
    } else {
        const index = array.indexOf(tag);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    return array;
}

export function designationComparator(a: any, b: any) {
    if (_isEqual(a.designation, b.designation)) {
        b.tags = _union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function definitionComparator(a: any, b: any) {
    if (_isEqual(a.definition, b.definition)) {
        b.tags = _union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

export function referenceDocumentComparator(a: any, b: any) {
    return _isEqual(a.document, b.document)
        && _isEqual(a.title, b.title)
        && _isEqual(a.uri, b.uri)
        && _isEqual(a.providerOrg, b.providerOrg)
        && _isEqual(a.docType, b.docType);
}

export function propertyComparator(a: any, b: any) {
    return _isEqual(a.key, b.key)
        && _isEqual(a.value, b.value)
        && _isEqual(a.source, b.source);
}

export function idComparator(a: any, b: any) {
    return _isEqual(a.id, b.id)
        && _isEqual(a.source, b.source);
}

export function attachmentComparator(a: any, b: any) {
    return _isEqual(a.fileid, b.fileid)
        && _isEqual(a.source, b.source);
}

export function dataSetComparator(a: any, b: any) {
    return _isEqual(a.id, b.id)
        && _isEqual(a.notes, b.notes)
        && _isEqual(a.source, b.source)
        && _isEqual(a.studyUri, b.studyUri);
}

export function derivationRuleComparator(a: any, b: any) {
    return _isEqual(a.ruleType, b.ruleType)
        && _isEqual(a.formula, b.formula)
        && _isEqual(a.name, b.name)
        && _isEqual(a.inputs, b.inputs)
        && _isEqual(a.outputs, b.outputs);
}

export function sourceComparator(a: any, b: any) {
    return _isEqual(a.sourceName, b.sourceName);
}
