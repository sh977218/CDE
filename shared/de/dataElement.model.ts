import { CdeId, copyArray, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';

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
    dataSets: DataSet[]; // mutable
    derivationRules: DerivationRule[]; // mutable
    elementType = 'cde';
    forkOf: string;
    mappingSpecifications: { // mutable
        content: string,
        script: string,
        spec_type: string,
    }[] = [];
    objectClass: Concepts; // mutable
    property: Concepts; // mutable
    valueDomain: ValueDomain; // mutable
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
    }
}

export class DataElementElastic extends DataElement {
}

export class DataSet {
    id: string;
    notes: string;
    source: string;
    studyUri: string;
}

export class ValueDomain {
    datatype: string;
    identifiers: CdeId[];
    ids: CdeId[];
    permissibleValues: PermissibleValue[];

    static copy(v: ValueDomain) {
        let newValueDomain = Object.assign(new ValueDomain(), v);
        newValueDomain.identifiers = [];
        copyArray(v.identifiers, newValueDomain.identifiers, CdeId);
        newValueDomain.ids = [];
        copyArray(v.ids, newValueDomain.ids, CdeId);
        newValueDomain.permissibleValues = [];
        copyArray(v.permissibleValues, newValueDomain.permissibleValues, PermissibleValue);
        return newValueDomain;
    }
}