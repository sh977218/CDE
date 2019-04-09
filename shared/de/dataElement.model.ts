import { CdeId, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';
import { fixDatatype } from 'shared/de/deValidator';

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
    elementType = 'cde';
    forkOf?: string;
    mappingSpecifications: { // mutable
        content?: string,
        script?: string,
        spec_type?: string,
    }[] = [];
    objectClass: Concepts = new Concepts(); // mutable
    property: Concepts = new Concepts(); // mutable
    valueDomain: ValueDomain = new ValueDomain(); // mutable
    views?: number;

    static getEltUrl(elt: Elt) {
        return "/deView?tinyId=" + elt.tinyId;
    }

    static validate(de: DataElement) {
        Elt.validate(de);

        if (!Array.isArray(de.derivationRules)) {
            de.derivationRules = [];
        }
        if (!de.valueDomain) de.valueDomain = new ValueDomain();
        fixDatatype(de);
        if (de.valueDomain.datatype === 'Date') {
            if (!de.valueDomain.datatypeDate) de.valueDomain.datatypeDate = new QuestionTypeDate();
            if (!de.valueDomain.datatypeDate.precision
                || QuestionTypeDate.PrecisionEnum.indexOf(de.valueDomain.datatypeDate.precision) === -1) {
                de.valueDomain.datatypeDate.precision = QuestionTypeDate.PrecisionDefault;
            }
        }
    }
}

export class DataElementElastic extends DataElement { // all volatile
    [key: string]: any; // used for highlighting
    flatClassifications?: string[];
    highlight?: any;
    primaryDefinitionCopy?: string;
    primaryNameCopy?: string;
    primaryNameSuggest?: string;
    score!: number;
}

export class QuestionTypeDate {
    precision?: string = 'Day';

    static PrecisionEnum = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'];
    static PrecisionDefault = 'Day';
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

export class QuestionTypeValueList {
    datatype?: string;
}

export class DataSet {
    id?: string;
    notes?: string;
    source?: string;
    studyUri?: string;
}

export type DataType = 'Value List' | 'Date' | 'Time' | 'File' | 'Geo Location' | 'Number' | 'Text' | 'Externally Defined';
export const DataTypeArray = ['Value List', 'Date', 'Time', 'File', 'Geo Location', 'Number', 'Text', 'Externally Defined'];

export class DatatypeContainer {
    datatype: DataType = 'Text';
    datatypeDate?: QuestionTypeDate; // mutable
    datatypeExternallyDefined?: QuestionTypeExternallyDefined; // mutable
    datatypeNumber?: QuestionTypeNumber; // mutable
    datatypeText?: QuestionTypeText; // mutable
    datatypeValueList?: QuestionTypeValueList; // mutable, unused, along with 2 more such objects
}

export class ValueDomain extends DatatypeContainer {
    definition?: string;
    identifiers: CdeId[] = [];
    ids: CdeId[] = [];
    permissibleValues: PermissibleValue[] = [];
    uom?: string;
    vsacOid?: string;
}
