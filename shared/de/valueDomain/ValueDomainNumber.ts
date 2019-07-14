import { isEmpty } from 'lodash';
import { DataTypeNumber } from "./DataTypeNumber";
import { ValueDomain } from "./ValueDomain";

export class ValueDomainNumber extends ValueDomain {
    datatype: string = 'Number';
    datatypeNumber?: DataTypeNumber;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeNumber)) {
            this.datatypeNumber = new DataTypeNumber(valueDomain.datatypeNumber);
        }
    }
}