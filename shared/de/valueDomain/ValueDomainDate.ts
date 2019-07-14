import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeDate } from "./DataTypeDate";

export class ValueDomainDate extends ValueDomain {
    datatype: string = 'Date';
    datatypeDate?: DataTypeDate;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeDate)) {
            this.datatypeDate = new DataTypeDate(valueDomain.datatypeDate);
        }
    }
}