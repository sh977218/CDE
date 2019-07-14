export class DataTypeValueList {
    datatype: string;

    constructor(dataTypeValueList) {
        if (dataTypeValueList.datatype) {
            this.datatype = dataTypeValueList.datatype + '';
        }
    }
}
