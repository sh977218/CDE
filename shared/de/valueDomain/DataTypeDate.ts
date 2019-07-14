export class DataTypeDate {
    precision: string;

    constructor(dataTypeDate) {
        if (dataTypeDate.precision) {
            this.precision = dataTypeDate.precision + '';
        }
    }
}