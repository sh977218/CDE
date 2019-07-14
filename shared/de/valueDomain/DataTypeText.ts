export class DataTypeText {
    minLength: number;
    maxLength: number;

    constructor(dataTypeText) {
        if (dataTypeText.minLength) {
            let minLengthString = dataTypeText.minLength + '';
            this.minLength = parseInt(minLengthString);
        }
        if (dataTypeText.maxLength) {
            let maxLengthString = dataTypeText.maxLength;
            this.maxLength = parseInt(maxLengthString);
        }
    }
}
