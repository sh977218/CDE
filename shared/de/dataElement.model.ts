import { CdeId, copyArray, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';
import { fixDatatype } from 'shared/de/deValidator';

class Concept {
    name: string;
    origin: string;
    originId: string;
}

class Concepts {
    concepts: Concept[] = [];
}

export class DataElement extends Elt {
    dataElementConcept: { // mutable
        concepts: Concept[],
        conceptualDomain: {
            vsac: {
                id: string,
                name: string,
                version: string
            }
        }
    };
    dataSets: DataSet[] = []; // mutable
    derivationRules: DerivationRule[] = []; // mutable
    elementType = 'cde';
    forkOf: string;
    mappingSpecifications: { // mutable
        content: string,
        script: string,
        spec_type: string,
    }[] = [];
    objectClass: Concepts = new Concepts(); // mutable
    property: Concepts = new Concepts(); // mutable
    valueDomain: ValueDomain = new ValueDomain(); // mutable
    views: number;

    constructor(elt: DataElement = undefined) {
        super(elt);
        if (!elt) return;

        // immutable
        this.forkOf = elt.forkOf;
        this.views = elt.views;

        // mutable
        this.dataElementConcept = elt.dataElementConcept ? JSON.parse(JSON.stringify(elt.dataElementConcept)) : undefined;
        this.dataSets = elt.dataSets ? JSON.parse(JSON.stringify(elt.dataSets)) : undefined;
        copyArray(elt.derivationRules, this.derivationRules, DerivationRule);
        this.mappingSpecifications = elt.mappingSpecifications ? JSON.parse(JSON.stringify(elt.mappingSpecifications)) : undefined;
        this.objectClass = elt.objectClass ? JSON.parse(JSON.stringify(elt.objectClass)) : undefined;
        this.property = elt.property ? JSON.parse(JSON.stringify(elt.property)) : undefined;
        this.valueDomain = ValueDomain.copy(elt.valueDomain);
    }

    static copy(de: DataElement) {
        return new DataElement(de);
    }

    getEltUrl() {
        return "/deView?tinyId=" + this.tinyId;
    }

    static validate(de: DataElement) {
        if (!Array.isArray(de.derivationRules)) {
            de.derivationRules = [];
        }
        if (!de.valueDomain) de.valueDomain = new ValueDomain();
        fixDatatype(de);
        if (de.valueDomain.datatype === 'Date' && QuestionTypeDate.PrecisionEnum.indexOf(de.valueDomain.datatypeDate.precision) === -1) {
            de.valueDomain.datatypeDate.precision = QuestionTypeDate.PrecisionDefault;
        }
    }
}

export class DataElementElastic extends DataElement {
    constructor(elt: DataElementElastic = undefined) {
        super(elt);
        if (!elt) return;
    }
    static copy(elt: DataElementElastic) {
        return DataElement.copy(elt);
    }
}

export class QuestionTypeDate {
    precision?: string = 'Day';

    static PrecisionEnum = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'];
    static PrecisionDefault = 'Day';

    static copy(q: QuestionTypeDate) {
        return Object.assign(new QuestionTypeDate(), q);
    }
}

export class QuestionTypeExternallyDefined {
    link?: string;
    description?: string;
    descriptionFormat?: string;

    static copy(q: QuestionTypeExternallyDefined) {
        return Object.assign(new QuestionTypeExternallyDefined(), q);
    }
}

export class QuestionTypeNumber {
    minValue?: number;
    maxValue?: number;
    precision?: number;

    static copy(q: QuestionTypeNumber) {
        return Object.assign(new QuestionTypeNumber(), q);
    }
}

export class QuestionTypeText {
    minLength?: number;
    maxLength?: number;
    regex?: string;
    rule?: string;
    showAsTextArea?: boolean;

    static copy(q: QuestionTypeText) {
        return Object.assign(new QuestionTypeText(), q);
    }
}

export class QuestionTypeValueList {
    datatype?: string;

    static copy(q: QuestionTypeValueList) {
        return Object.assign(new QuestionTypeValueList(), q);
    }
}

export class DataSet {
    id: string;
    notes: string;
    source: string;
    studyUri: string;
}

export class DatatypeContainer {
    datatype: string;
    datatypeDate?: QuestionTypeDate; // mutable
    datatypeExternallyDefined?: QuestionTypeExternallyDefined; // mutable
    datatypeNumber?: QuestionTypeNumber; // mutable
    datatypeText?: QuestionTypeText; // mutable
    datatypeValueList?: QuestionTypeValueList; // mutable, unused, along with 2 more such objects

    static copy(newContainer: any, container: any) {
        switch (newContainer.datatype) {
            case 'Value List':
                newContainer.datatypeValueList = container.datatypeValueList
                    ? QuestionTypeValueList.copy(container.datatypeValueList) : new QuestionTypeValueList();
                break;
            case 'Date':
                newContainer.datatypeDate = container.datatypeDate
                    ? QuestionTypeDate.copy(container.datatypeDate) : new QuestionTypeDate();
                break;
            case 'Number':
                newContainer.datatypeNumber = container.datatypeNumber
                    ? QuestionTypeNumber.copy(container.datatypeNumber) : new QuestionTypeNumber();
                break;
            case 'Externally Defined':
                newContainer.datatypeExternallyDefined = container.datatypeExternallyDefined
                    ? QuestionTypeExternallyDefined.copy(container.datatypeExternallyDefined)
                    : new QuestionTypeExternallyDefined();
                break;
            case 'Text':
            default:
                newContainer.datatypeText = container.datatypeText
                    ? QuestionTypeText.copy(container.datatypeText) : new QuestionTypeText();
        }
    }
}

export class ValueDomain extends DatatypeContainer {
    identifiers: CdeId[] = [];
    ids: CdeId[] = [];
    permissibleValues: PermissibleValue[] = [];
    uom: string;
    vsacOid: string;

    static copy(v: ValueDomain) {
        let newValueDomain = Object.assign(new ValueDomain(), v);
        super.copy(newValueDomain, v);

        copyArray(v.identifiers, newValueDomain.identifiers, CdeId);
        newValueDomain.ids = [];
        copyArray(v.ids, newValueDomain.ids, CdeId);
        newValueDomain.permissibleValues = [];
        copyArray(v.permissibleValues, newValueDomain.permissibleValues, PermissibleValue);

        return newValueDomain;
    }
}
