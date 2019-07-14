import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeTime } from "./DataTypeTime";
export class ValueDomainTime extends ValueDomain {
    datatype: string = 'Date';
    dataTypeTime?: DataTypeTime;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.dataTypeTime)) {
            this.dataTypeTime = new DataTypeTime(valueDomain.dataTypeTime);
        }
    }
}