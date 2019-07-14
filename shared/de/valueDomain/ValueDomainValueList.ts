import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeValueList } from "./DataTypeValueList";
import { PermissibleValue } from "./PermissibleValue";

export class ValueDomainValueList extends ValueDomain {
    datatype: string = 'Value List';
    datatypeValueList?: DataTypeValueList;
    permissibleValues: PermissibleValue[];

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeValueList)) {
            this.datatypeValueList = new DataTypeValueList(valueDomain.datatypeValueList);
        }
        if (!isEmpty(valueDomain.permissibleValues)) {
            valueDomain.permissibleValues.forEach(p => {
                let pv = new PermissibleValue(p);
                this.permissibleValues.push(pv);
            });
        }
    }
}