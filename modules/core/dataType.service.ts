import { Injectable } from '@angular/core';

@Injectable()
export class DataTypeService {
    static dataElementDataType = ['Text', 'Number', 'Date', 'Time', 'Value List', 'File', 'Externally Defined'];

    public static getDataType() {
        return this.dataElementDataType;
    }

    public static getDataTypeItemList() {
        return this.dataElementDataType.map(d => {
            return {label: d, value: d};
        });
    }
}


