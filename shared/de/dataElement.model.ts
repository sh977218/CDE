import { CdeId, CurationStatus, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';
import { Question } from 'shared/form/form.model';
import { copyValueDomain } from 'shared/datatype';
import { Dictionary } from 'async';

export interface Concept {
    name?: string;
    origin: string;
    originId?: string;
    type: string;
}

export class Concepts {
    concepts: Concept[] = [];
}

type Precision = 'Year' | 'Month' | 'Day' | 'Hour' | 'Minute' | 'Second';
export class QuestionTypeDate {
    precision?: Precision;
    format?: string;

    static PRECISION_ENUM = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'];
    static PRECISION_DEFAULT: Precision = 'Day';

    constructor() {
        this.precision = QuestionTypeDate.PRECISION_DEFAULT;
    }
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

export class DataElement extends Elt {
    partOfBundles: string[] = []; // mutable by system batch only
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
    objectClass: Concepts = new Concepts(); // mutable
    property: Concepts = new Concepts(); // mutable
    valueDomain: ValueDomain = valueDomain(); // mutable
    views?: number;

    static getEltUrl(elt: Elt) {
        return '/deView?tinyId=' + elt.tinyId;
    }

    static validate(de: DataElement) {
        Elt.validate(de);

        if (!Array.isArray(de.derivationRules)) {
            de.derivationRules = [];
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

export interface ElasticElement {
    classificationBoost: number;
    classificationSize: number;
    flatClassifications?: string[];
    flatIds: string[];
    flatProperties: string[];
    highlight?: any;
    noRenderAllowed?: boolean;
    primaryDefinitionCopy?: string;
    primaryNameCopy: string;
    score: number;
    steward: string;
    stewardOrgCopy: {
        name: string
    }
}

export interface DataElementElastic extends DataElement, ElasticElement { // all volatile
    linkedForms: {
        [key in CurationStatus]: number
    } & {
        forms: {
            tinyId: string;
            registrationStatus: CurationStatus;
            primaryName: string;
            noRenderAllowed?: boolean;
        }[]
    };
    valueDomain: ValueDomain & {nbOfPVs?: number};
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

export function valueDomain(): ValueDomain {
    return {
        datatype: 'Text',
        identifiers: [] as CdeId[],
        ids: [] as CdeId[],
        datatypeText: {},
    };
}

type ErrorMessage = {
    allValid: true;
} | {
    allValid: false;
    message: string;
};

export function checkPvUnicity(valueDomain: ValueDomain): ErrorMessage {
    if (valueDomain.datatype !== 'Value List') {
        return {allValid: true};
    }
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues && valueDomain.permissibleValues.length === 0) {
        return resultInvalid('Value List must contain at least one Permissible Value');
    }
    const allCodes: Dictionary<number> = {};
    const allPvs: Dictionary<number> = {};
    const allVms: Dictionary<number> = {};
    return (valueDomain.permissibleValues || []).reduce<ErrorMessage>((acc, pv) => {
        const pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        const pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
        if (pvCode.length > 0 && pvCodeSystem.length === 0) {
            return resultInvalid(pv.notValid = 'pvCode is not empty, pvCodeSystem is empty');
        }
        if (allPvs[pv.permissibleValue]) {
            return resultInvalid(pv.notValid = 'Duplicate Permissible Value: ' + pv.permissibleValue);
        }
        if (pv.valueMeaningName && allVms[pv.valueMeaningName]) {
            return resultInvalid(pv.notValid = 'Duplicate Code Name: ' + pv.valueMeaningName);
        }
        if (pv.valueMeaningCode && allCodes[pv.valueMeaningCode]) {
            return resultInvalid(pv.notValid = 'Duplicate Code: ' + pv.valueMeaningCode);
        }
        if (pv.permissibleValue) {
            allPvs[pv.permissibleValue] = 1;
        }
        if (pv.valueMeaningName && pv.valueMeaningName.length > 0 && pv.valueMeaningName.indexOf('Login to see the value') === -1) {
            allVms[pv.valueMeaningName] = 1;
        }
        if (pv.valueMeaningCode && pv.valueMeaningCode.length > 0 && pv.valueMeaningCode.indexOf('Login to see the value') === -1) {
            allCodes[pv.valueMeaningCode] = 1;
        }
        delete pv.notValid;
        return acc;
    }, {allValid: true});
}

export function checkDefinitions(elt: DataElement): ErrorMessage {
    let result: ErrorMessage = {allValid: true};
    elt.definitions.forEach(def => {
        if (!def.definition || !def.definition.length) {
            result = resultInvalid('Definition may not be empty.');
        }
    });
    return result;
}

export function fixDatatype(dc: Partial<Question | ValueDomain>): void {
    if (!dc.datatype) {
        dc.datatype = 'Text';
    }
    if (dc.datatype === 'Value List' && !dc.datatypeValueList) {
        dc.datatypeValueList = {};
        if (!(dc as ValueDomainValueList).permissibleValues) {
            (dc as ValueDomainValueList).permissibleValues = [];
        }
    }
    if (dc.datatype === 'Number' && !dc.datatypeNumber) {
        dc.datatypeNumber = {};
    }
    if (dc.datatype === 'Text' && !dc.datatypeText) {
        dc.datatypeText = {};
    }
    if (dc.datatype === 'Date' && !dc.datatypeDate) {
        dc.datatypeDate = {};
    }
    if (dc.datatype === 'Dynamic Code List' && !dc.datatypeDynamicCodeList) {
        dc.datatypeDynamicCodeList = {};
    }
    if (dc.datatype === 'Externally Defined' && !dc.datatypeExternallyDefined) {
        dc.datatypeExternallyDefined = {};
    }
}

export function fixDataElement(elt: DataElement): void {
    if (!elt.valueDomain) {
        elt.valueDomain = valueDomain() as ValueDomain;
    }
    fixDatatype(elt.valueDomain);
}

export function wipeDatatype(elt: DataElement): void {
    if (elt.elementType !== 'cde') {
        return;
    }
    fixDataElement(elt);
    const valueDomain: Partial<ValueDomain> = {
        definition: elt.valueDomain.definition,
        identifiers: elt.valueDomain.identifiers,
        ids: elt.valueDomain.ids,
        uom: elt.valueDomain.uom,
        vsacOid: elt.valueDomain.vsacOid
    };
    elt.valueDomain = copyValueDomain(elt.valueDomain, valueDomain) as ValueDomain;
}

function resultInvalid(message: string): ErrorMessage {
    return {
        allValid: false,
        message
    };
}
