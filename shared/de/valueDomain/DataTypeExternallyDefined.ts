export class DataTypeExternallyDefined {
    link: string;
    description: string;
    descriptionFormat: string;

    constructor(dataTypeExternallyDefined) {
        if (dataTypeExternallyDefined.link) {
            this.link = dataTypeExternallyDefined.link + '';
        }
        if (dataTypeExternallyDefined.description) {
            this.description = dataTypeExternallyDefined.description + '';
        }
        if (dataTypeExternallyDefined.descriptionFormat) {
            this.descriptionFormat = dataTypeExternallyDefined.descriptionFormat + '';
        }
    }
}
