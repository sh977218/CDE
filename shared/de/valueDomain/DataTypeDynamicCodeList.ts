export class DataTypeDynamicCodeList {
    system: string;
    code: string;

    constructor(dataTypeDynamicCodeList) {
        if (dataTypeDynamicCodeList.system) {
            this.system = dataTypeDynamicCodeList.system + '';
        }
        if (dataTypeDynamicCodeList.code) {
            this.code = dataTypeDynamicCodeList.code + '';
        }
    }
}
