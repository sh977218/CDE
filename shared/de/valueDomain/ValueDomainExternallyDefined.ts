import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeExternallyDefined } from "./DataTypeExternallyDefined";

export class ValueDomainExternallyDefined extends ValueDomain {
    datatype: string = 'Externally Defined';
    dataTypeExternallyDefined?: DataTypeExternallyDefined;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.dataTypeExternallyDefined)) {
            this.dataTypeExternallyDefined = new DataTypeExternallyDefined(valueDomain.dataTypeExternallyDefined);
        }
    }
}