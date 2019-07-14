import { isEmpty } from 'lodash';

export class ValueDomain {
    uom?: string;
    vsacOid?: string;
    datatype: string = 'Text';

    // those are for NCI source, they should move to sources
    name?: string;
    identifiers?: [any];
    ids?: [any];
    definition?: string;

    constructor(valueDomain) {
        if (valueDomain.datatype) {
            this.datatype = valueDomain.datatype;
        }
        if (!isEmpty(valueDomain.uom)) {
            this.uom = valueDomain.uom;
        }
        if (!isEmpty(valueDomain.vsacOid)) {
            this.vsacOid = valueDomain.vsacOid;
        }
        if (!isEmpty(valueDomain.name)) {
            this.name = valueDomain.name;
        }
        if (!isEmpty(valueDomain.identifiers)) {
            this.identifiers = valueDomain.identifiers;
        }
        if (!isEmpty(valueDomain.ids)) {
            this.ids = valueDomain.ids;
        }
        if (!isEmpty(valueDomain.definition)) {
            this.definition = valueDomain.definition;
        }
    }
}
