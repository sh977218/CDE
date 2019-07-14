export class DataTypeNumber {
    minValue: number;
    maxValue: number;
    precision: number;

    constructor(dataTypeNumber) {
        if (dataTypeNumber.minValue) {
            let minValueString = dataTypeNumber.minValue + '';
            this.minValue = parseInt(minValueString);
        }
        if (dataTypeNumber.maxValue) {
            let maxValueString = dataTypeNumber.maxValue;
            this.maxValue = parseInt(maxValueString);
        }
        if (dataTypeNumber.precision) {
            let precisionString = dataTypeNumber.precision;
            this.precision = parseInt(precisionString);
        }
    }
}
