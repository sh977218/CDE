import { CdeId, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';
import { fixDataElement } from 'shared/de/deValidator';

export class Concept {
    name?: string;
    origin?: string;
    originId?: string;
}

export class Concepts {
    concepts: Concept[] = [];
}

export class DataElement extends Elt {
    dataElementConcept?: { // mutable
        concepts?: Concept[],
        conceptualDomain?: {
            vsac?: {
                id?: string,
                name?: string,
                version?: string
            }
        }
    };
    dataSets: DataSet[] = []; // mutable
    derivationRules: DerivationRule[] = []; // mutable
    elementType: 'cde' = 'cde';
    forkOf?: string;
    mappingSpecifications: { // mutable
        content?: string,
        script?: string,
        spec_type?: string,
    }[] = [];
    objectClass: Concepts = new Concepts(); // mutable
    property: Concepts = new Concepts(); // mutable
    valueDomain: ValueDomain = valueDomain() as ValueDomain; // mutable
    views?: number;

    static getEltUrl(elt: Elt) {
        return '/deView?tinyId=' + elt.tinyId;
    }

    static validate(de: DataElement) {
        Elt.validate(de);

        if (!Array.isArray(de.derivationRules)) {
            de.derivationRules = [];
        }
        if (!de.valueDomain) {
            de.valueDomain = valueDomain() as ValueDomain;
        }
        fixDataElement(de);
        if (de.valueDomain.datatype === 'Date') {
            if (!de.valueDomain.datatypeDate) {
                de.valueDomain.datatypeDate = new QuestionTypeDate();
            }
            if (!de.valueDomain.datatypeDate.precision
                || QuestionTypeDate.PRECISION_ENUM.indexOf(de.valueDomain.datatypeDate.precision) === -1) {
                de.valueDomain.datatypeDate.precision = QuestionTypeDate.PRECISION_DEFAULT;
            }
        }
    }
}

export class DataElementElastic extends DataElement { // all volatile
    [key: string]: any; // used for highlighting
    flatClassifications?: string[];
    highlight?: any;
    linkedForms?: string;
    primaryDefinitionCopy?: string;
    primaryNameCopy!: string;
    primaryNameSuggest?: string;
    score!: number;
    valueDomain!: ValueDomain & {nbOfPVs: number};
}

type Precision = 'Year' | 'Month' | 'Day' | 'Hour' | 'Minute' | 'Second';
export class QuestionTypeDate {
    precision?: Precision = QuestionTypeDate.PRECISION_DEFAULT;
    format?: string;

    static PRECISION_ENUM = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'];
    static PRECISION_DEFAULT: Precision = 'Day';
}

export class QuestionTypeDynamicCodeList {
    system?: string = '';
    code?: string = '';
}

export class QuestionTypeExternallyDefined {
    link?: string;
    description?: string;
    descriptionFormat?: string;
}

export class QuestionTypeNumber {
    minValue?: number;
    maxValue?: number;
    precision?: number;
}

export class QuestionTypeText {
    minLength?: number;
    maxLength?: number;
    regex?: string;
    rule?: string;
    showAsTextArea?: boolean;
}

export class QuestionTypeTime { // mutable, time only, periodic?
    format?: string;
}

export class QuestionTypeValueList {
    datatype?: string;
}

export class DataSet {
    id?: string;
    notes?: string;
    source?: string;
    studyUri?: string;
}

export type DataType =
    'Date'
    | 'Dynamic Code List'
    | 'Externally Defined'
    | 'File'
    | 'Geo Location'
    | 'Number'
    | 'Text'
    | 'Time'
    | 'Value List';

export const DATA_TYPE_ARRAY = Object.freeze([
    'Date',
    'Dynamic Code List',
    'Externally Defined',
    'File',
    'Geo Location',
    'Number',
    'Text',
    'Time',
    'Value List'
]);

export interface DatatypeContainerDate {
    datatype: 'Date';
    datatypeDate: QuestionTypeDate;
}

export interface DatatypeContainerDynamicList {
    datatype: 'Dynamic Code List';
    datatypeDynamicCodeList: QuestionTypeDynamicCodeList;
}

export interface DatatypeContainerExternal {
    datatype: 'Externally Defined';
    datatypeExternallyDefined: QuestionTypeExternallyDefined;
}

export interface DatatypeContainerFile {
    datatype: 'File';
}

export interface DatatypeContainerGeo {
    datatype: 'Geo Location';
}

export interface DatatypeContainerNumber {
    datatype: 'Number';
    datatypeNumber: QuestionTypeNumber;
}

export interface DatatypeContainerText {
    datatype: 'Text';
    datatypeText: QuestionTypeText;
}

export interface DatatypeContainerTime {
    datatype: 'Time';
    datatypeTime: QuestionTypeTime;
}

export interface DatatypeContainerValueList {
    datatype: 'Value List';
    datatypeValueList?: QuestionTypeValueList;
}

export type DatatypeContainer = DatatypeContainerDate
    | DatatypeContainerDynamicList
    | DatatypeContainerExternal
    | DatatypeContainerFile
    | DatatypeContainerGeo
    | DatatypeContainerNumber
    | DatatypeContainerText
    | DatatypeContainerTime
    | DatatypeContainerValueList;

export type ValueDomain = ValueDomainValueList
    | ValueDomainDate
    | ValueDomainDynamicList
    | ValueDomainExternal
    | ValueDomainFile
    | ValueDomainGeo
    | ValueDomainNumber
    | ValueDomainText
    | ValueDomainTime;

interface ValueDomainPart {
    definition?: string;
    identifiers: CdeId[];
    ids: CdeId[];
    uom?: string;
    vsacOid?: string;
}

export type ValueDomainDate = DatatypeContainerDate & ValueDomainPart;
export type ValueDomainDynamicList = DatatypeContainerDynamicList & ValueDomainPart;
export type ValueDomainExternal = DatatypeContainerExternal & ValueDomainPart;
export type ValueDomainFile = DatatypeContainerFile & ValueDomainPart;
export type ValueDomainGeo = DatatypeContainerGeo & ValueDomainPart;
export type ValueDomainNumber = DatatypeContainerNumber & ValueDomainPart;
export type ValueDomainText = DatatypeContainerText & ValueDomainPart;
export type ValueDomainTime = DatatypeContainerTime & ValueDomainPart;
export type ValueDomainValueList = DatatypeContainerValueList & ValueDomainPart & {
    permissibleValues: PermissibleValue[];
};

export function valueDomain(): Partial<ValueDomain> {
    return {
        datatype: 'Text',
        identifiers: [],
        ids: [],
    };
}
