import { Injectable } from '@angular/core';

@Injectable()
export class DataTypeService {
    dataElementDataType = ['Text', 'Number', 'Date', 'Time', 'Value List', 'Externally Defined'];

    public getDataElementDataType() {
        return this.dataElementDataType.map(d => {
            return {label: d, value: d};
        });
    }
}


