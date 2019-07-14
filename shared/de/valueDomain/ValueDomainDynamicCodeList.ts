import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeDynamicCodeList } from "./DataTypeDynamicCodeList";

export class ValueDomainDynamicCodeList extends ValueDomain {
    datatype: string = 'Dynamic Code List';
    datatypeDynamicCodeList?: DataTypeDynamicCodeList;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeDynamicCodeList)) {
            this.datatypeDynamicCodeList = new DataTypeDynamicCodeList(valueDomain.datatypeDynamicCodeList);
        }
    }
}