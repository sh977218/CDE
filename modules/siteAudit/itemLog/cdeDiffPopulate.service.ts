// sample template:
// <tr>
//   <td class="fieldName">{{d.fieldName}}</td>
//   <td>{{d.modificationType}}</td>
//   <td class="newValue">{{d.newValue}}</td>
//   <td class="previousValue">{{d.previousValue}}</td>
// </tr>
import * as _isEmpty from 'lodash/isEmpty';
import { capCase, decamelize } from 'shared/system/util';
import { EltLogDiff, EltLogDiffAmend } from 'shared/models.model';

export function ignoredDiff(d: EltLogDiff): boolean {
    switch (d.kind) {
        case 'D':
            return !d.previousValue;
        case 'E':
            return !d.previousValue && !d.newValue;
        case 'N':
            return !d.newValue || typeof d.newValue === 'object' && _isEmpty(d.newValue);
        default:
            return false;
    }
}


// prettify audit.diff format
export function makeHumanReadable(change: EltLogDiff): void {
    if (!change) {
        return;
    }
    switch (change.kind) {
        case 'A':
            switch (change.item.kind) {
                case 'D':
                    change.modificationType = 'Item Deleted';
                    change.previousValue = stringify(change.item.lhs);
                    break;
                case 'N':
                    change.modificationType = 'New Item';
                    change.newValue = stringify(change.item.rhs);
                    break;
            }
            break;
        case 'D':
            change.modificationType = 'Item Deleted';
            change.previousValue = stringify(change.lhs);
            break;
        case 'E':
            change.modificationType = 'Modified Field';
            change.previousValue = change.lhs;
            change.newValue = change.rhs;
            break;
        case 'N':
            change.modificationType = 'New Item';
            change.newValue = stringify(change.rhs);
            break;
    }
    if (change.path.length === 0) {
        return;
    }
    if (change.path[0] === 'classification') {
        change.fieldName = 'Classification';
        if ((change as EltLogDiffAmend).item) {
            change = change as EltLogDiffAmend;
            if (change.item.lhs) {
                change.newValue = stringifyClassif(change.item.lhs);
            }
            if (change.item.rhs) {
                change.newValue = stringifyClassif(change.item.rhs);
            }
        }
        return;
    }
    const paths = pathFieldMap[change.path.length] && pathFieldMap[change.path.length]
        .filter(pathPair => comparePaths(pathPair.path, change.path)) || [];
    change.fieldName = paths.length
        ? paths[0].fieldName
        : capCase(decamelize(change.path[change.path.length - 1] as string));
}

function comparePaths(patternPath: (string | number)[], realPath: (string | number)[]) {
    return !patternPath || !patternPath.some((el, i) => !(typeof el === 'number' && el === -1) && el !== realPath[i]);
}

function stringify(obj: any): string {
    switch (typeof obj) {
        case 'number':
        case 'string':
            return obj as string;
        case 'object':
            return obj ? Object.keys(obj).map(f => f + ': ' + obj[f]).join(', ') : '';
        default:
            return '';
    }
}

function stringifyClassif(obj: any): string {
    return obj && obj.elements ? ' > ' + obj.name + stringifyClassif(obj.elements[0]) : '';
}

const pathFieldMap: { [num: number]: { fieldName: string, path: (string | number)[] }[] } = {
    1: [
        {fieldName: 'Designations', path: ['designations']},
        {fieldName: 'Definitions', path: ['definitions']},
        {fieldName: 'Properties', path: ['properties']},
        {fieldName: 'Identifiers', path: ['ids']},
        {fieldName: 'Attachments', path: ['attachments']},
        {fieldName: 'Version', path: ['version']}
    ],
    2: [
        {fieldName: 'Concepts - Property', path: ['property', 'concepts']},
        {fieldName: 'Concepts - Object Class', path: ['objectClass', 'concepts']},
        {fieldName: 'Concepts - Data Element', path: ['dataElementConcept', 'concepts']},
        {fieldName: 'Registration State', path: ['registrationState', 'registrationStatus']},
        {fieldName: 'Steward Organization', path: ['stewardOrg', 'name']},
        {fieldName: 'Permissible Values - Value Type', path: ['valueDomain', 'datatype']},
        {fieldName: 'Permissible Values - Text', path: ['valueDomain', 'datatypeText']},
        {fieldName: 'Permissible Values - Integer', path: ['valueDomain', 'datatypeInteger']},
        {fieldName: 'Permissible Values - Number', path: ['valueDomain', 'datatypeNumber']},
        {fieldName: 'Permissible Values - Date', path: ['valueDomain', 'datatypeDate']},
        {fieldName: 'Permissible Values - Value List', path: ['valueDomain', 'datatypeValueList']},
        {fieldName: 'Unit of Measure', path: ['valueDomain', 'uom']},
        {fieldName: 'Permissible Values - VSAC Mapping', path: ['dataElementConcept', 'conceptualDomain']},
        {fieldName: 'Permissible Values - Externaly Defined', path: ['valueDomain', 'datatypeExternallyDefined']},
        {fieldName: 'Permissible Values', path: ['valueDomain', 'permissibleValues']},
        {fieldName: 'Permissible Values - Float', path: ['valueDomain', 'datatypeFloat']}
    ],
    3: [
        {fieldName: 'Naming - Other Name', path: ['designations', -1, 'designation']},
        {fieldName: 'Naming - Other Definition', path: ['definitions', -1, 'definition']},
        {fieldName: 'Primary Name', path: ['designations', 0, 'designation']},
        {fieldName: 'Primary Definition', path: ['definitions', 0, 'definition']},
        {
            fieldName: 'Permissible Values - Text - Regular Expression',
            path: ['valueDomain', 'datatypeText', 'regex']
        },
        {fieldName: 'Permissible Values - Text - Freetext Rule', path: ['valueDomain', 'datatypeText', 'rule']},
        {
            fieldName: 'Permissible Values - Text - Maximum Length',
            path: ['valueDomain', 'datatypeText', 'maxLength']
        },
        {
            fieldName: 'Permissible Values - Text - Minimum Length',
            path: ['valueDomain', 'datatypeText', 'minLength']
        },
        {
            fieldName: 'Permissible Values - Integer - Maximum Value',
            path: ['valueDomain', 'datatypeInteger', 'maxValue']
        },
        {
            fieldName: 'Permissible Values - Integer - Minimum Value',
            path: ['valueDomain', 'datatypeInteger', 'minValue']
        },
        {
            fieldName: 'Permissible Values - Number - Maximum Value',
            path: ['valueDomain', 'datatypeNumber', 'maxValue']
        },
        {
            fieldName: 'Permissible Values - Number - Minimum Value',
            path: ['valueDomain', 'datatypeNumber', 'minValue']
        },
        {fieldName: 'Permissible Values - Date - Format', path: ['valueDomain', 'datatypeDate', 'format']},
        {
            fieldName: 'Permissible Values - Value List - Datatype',
            path: ['valueDomain', 'datatypeValueList', 'datatype']
        },
        {fieldName: 'Permissible Values - Properties - Value', path: ['properties', -1, 'value']},
        {fieldName: 'Naming - Other Definition - Format', path: ['naming', -1, 'definitionFormat']},
        {
            fieldName: 'Permissible Values - Float - Minimum Value',
            path: ['valueDomain', 'datatypeFloat', 'minValue']
        },
        {
            fieldName: 'Permissible Values - Float - Maximum Value',
            path: ['valueDomain', 'datatypeFloat', 'maxValue']
        },
        {fieldName: 'Permissible Values - Float - Precision', path: ['valueDomain', 'datatypeFloat', 'precision']},
        {fieldName: 'Properties - Value - Format', path: ['properties', -1, 'valueFormat']},
        {fieldName: 'Properties - Key', path: ['properties', -1, 'key']},
        {fieldName: 'Identifiers - Source', path: ['ids', -1, 'source']},
        {fieldName: 'Identifiers - ID', path: ['ids', -1, 'id']},
        {fieldName: 'Identifiers - Version', path: ['ids', -1, 'version']},
        {fieldName: 'Attachments - File ID', path: ['attachments', -1, 'fileid']},
        {fieldName: 'Attachments - Filename', path: ['attachments', -1, 'filename']},
        {fieldName: 'Attachments - Upload Date', path: ['attachments', -1, 'uploadDate']},
        {fieldName: 'Attachments - File Size', path: ['attachments', -1, 'filesize']}
    ],
    4: [
        {fieldName: 'Permissible Values', path: ['valueDomain', 'permissibleValues', -1, 'permissibleValue']},
        {fieldName: 'Concepts - Data Element - Name', path: ['dataElementConcept', 'concepts', -1, 'name']},
        {fieldName: 'Concepts - Data Element - Origin', path: ['dataElementConcept', 'concepts', -1, 'origin']},
        {
            fieldName: 'Concepts - Data Element - Origin ID',
            path: ['dataElementConcept', 'concepts', -1, 'originId']
        },
        {
            fieldName: 'Permissible Values - Code Name',
            path: ['valueDomain', 'permissibleValues', -1, 'valueMeaningName']
        },
        {
            fieldName: 'Permissible Values - Value',
            path: ['valueDomain', 'permissibleValues', -1, 'permissibleValue']
        },
        {
            fieldName: 'Permissible Values - Code',
            path: ['valueDomain', 'permissibleValues', -1, 'valueMeaningCode']
        },
        {
            fieldName: 'Permissible Values - Code System',
            path: ['valueDomain', 'permissibleValues', -1, 'codeSystemName']
        },
        {fieldName: 'Properties - Object Class - Name', path: ['objectClass', 'concepts', -1, 'name']}
    ],
};
