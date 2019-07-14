import { isEmpty } from 'lodash';
import { ValueDomain } from "./ValueDomain";
import { DataTypeText } from "./DataTypeText";

export class ValueDomainText extends ValueDomain {
    datatype: string = 'Text';
    datatypeText?: DataTypeText;

    constructor(valueDomain) {
        super(valueDomain);
        if (!isEmpty(valueDomain.datatypeText)) {
            this.datatypeText = new DataTypeText(valueDomain.datatypeText);
        }
    }
}