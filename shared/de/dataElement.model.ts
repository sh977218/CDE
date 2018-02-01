import { CdeId, DerivationRule, Elt, PermissibleValue } from 'shared/models.model';


export class DataElement extends Elt {
    primaryNameCopy: string;
    derivationRules: DerivationRule[];
    elementType = 'cde';
    valueDomain: ValueDomain;

    static copy(de: any) {
        return Object.assign(new DataElement, de);
    }

    getEltUrl() {
        return "/deView?tinyId=" + this.tinyId;
    }

    getLabel() {
        if (this.primaryNameCopy)
            return this.primaryNameCopy;
        else return this.naming[0].designation;
    }

    static validate(de: DataElement) {
        if (!Array.isArray(de.derivationRules))
            de.derivationRules = [];
    }
}

export class ValueDomain {
    datatype: string;
    identifiers: CdeId[];
    ids: CdeId[];
    permissibleValues: PermissibleValue[];
}