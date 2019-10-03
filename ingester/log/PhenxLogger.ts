export class PhenxLogger {
    static createdPhenxForm: any = 0;
    static createdPhenxForms: any[] = [];

    static samePhenxForm: any = 0;
    static samePhenxForms: any[] = [];

    static changedPhenxForm = 0;
    static changedPhenxForms: any[] = [];

    static retiredPhenxForm: any = 0;
    static retiredPhenxForms: any[] = [];
    static retiredPhenxCde: any = 0;
    static retiredPhenxCdes: any[] = [];

    static log() {
        console.log('createdPhenxForm: ' + this.createdPhenxForm);
        console.log('createdPhenxForms: ' + this.createdPhenxForms);
        console.log('samePhenxForm: ' + this.samePhenxForm);
        console.log('samePhenxForms: ' + this.samePhenxForms);
        console.log('changedPhenxForm: ' + this.changedPhenxForm);
        console.log('changedPhenxForms: ' + this.changedPhenxForms);
        console.log('retiredPhenxCde: ' + this.retiredPhenxCde);
        console.log('retiredPhenxCdes: ' + this.retiredPhenxCdes);
        console.log('retiredPhenxForm: ' + this.retiredPhenxForm);
        console.log('retiredPhenxForms: ' + this.retiredPhenxForms);
    }
}
