import { Injectable } from '@angular/core';

@Injectable()
export class DataTypeService {
    static dataElementDataType = ['Text', 'Number', 'Date', 'Time', 'Value List', 'Externally Defined'];

    public static getDataElementDataType() {
        return this.dataElementDataType.map(d => {
            return {label: d, value: d};
        });
    }
}


