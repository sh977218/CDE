import { DerivationRule, Elt } from "core/public/models.model";

export class DataElement extends Elt {
    primaryNameCopy: string;
    derivationRules: [DerivationRule];

    getEltUrl() {
        return "/deView?tinyId=" + this.tinyId;
    }

    getLabel() {
        if (this.primaryNameCopy)
            return this.primaryNameCopy;
        else return this.naming[0].designation;
    }
}