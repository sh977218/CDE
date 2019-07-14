export class DataTypeTime {
    format: string;

    constructor(dataTypeTime) {
        if (dataTypeTime.format) {
            this.format = dataTypeTime.format + '';
        }
    }
}
