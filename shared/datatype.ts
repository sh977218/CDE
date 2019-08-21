import { DatatypeContainer, valueDomain, ValueDomain } from 'shared/de/dataElement.model';
import { assertUnreachable } from 'shared/models.model';

export function copyDatatypeContainer(source: DatatypeContainer, target: Partial<DatatypeContainer>): DatatypeContainer {
    target.datatype = source.datatype;
    const s: any = source;
    const t: DatatypeContainer = target as DatatypeContainer;
    switch (t.datatype) {
        case 'Date':
            t.datatypeDate = s.datatypeDate;
            break;
        case 'Dynamic Code List':
            t.datatypeDynamicCodeList = s.datatypeDynamicCodeList;
            break;
        case 'Externally Defined':
            t.datatypeExternallyDefined = s.datatypeExternallyDefined;
            break;
        case 'File':
            break;
        case 'Geo Location':
            break;
        case 'Number':
            t.datatypeNumber = s.datatypeNumber;
            break;
        case 'Text':
            t.datatypeText = s.datatypeText;
            break;
        case 'Time':
            t.datatypeTime = s.datatypeTime;
            break;
        case 'Value List':
            t.datatypeValueList = s.datatypeValueList;
            break;
        default:
            throw assertUnreachable(t);
    }
    return t;
}

export function copyValueDomain(source: ValueDomain, target: Partial<ValueDomain> = valueDomain()): ValueDomain {
    const s: any = source;
    const t: ValueDomain = copyDatatypeContainer(source, target) as ValueDomain;
    if (t.datatype === 'Value List') {
        t.permissibleValues = s.permissibleValues;
    }
    return t;
}
