export class PermissibleValue {
    permissibleValue: string;
    valueMeaningName: string;
    valueMeaningCode?: string;
    codeSystemName?: string;
    codeSystemVersion?: string;
    valueMeaningDefinition?: string;

    constructor(pv) {
        if (!pv.permissibleValue && !pv.valueMeaningName) {
            throw "permissibleValue or valueMeaningName is required.";
        } else {
            if (pv.permissibleValue) {
                this.permissibleValue = pv.permissibleValue;
            } else {
                this.permissibleValue = pv.valueMeaningName;
            }

            if (pv.valueMeaningName) {
                this.valueMeaningName = pv.valueMeaningName;
            } else {
                this.valueMeaningName = pv.permissibleValue;
            }

            if (pv.valueMeaningCode) {
                this.valueMeaningCode = pv.valueMeaningCode;
            }
            if (pv.codeSystemName) {
                this.codeSystemName = pv.codeSystemName;
            }
            if (pv.codeSystemVersion) {
                this.codeSystemVersion = pv.codeSystemVersion;
            }
            if (pv.valueMeaningDefinition) {
                this.valueMeaningDefinition = pv.valueMeaningDefinition;
            }
        }
    }
}