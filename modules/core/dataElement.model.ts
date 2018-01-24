import { DerivationRule, Elt } from "core/models.model";

export class DataElement extends Elt {
    primaryNameCopy: string;
    derivationRules: DerivationRule[];
    elementType = 'cde';

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