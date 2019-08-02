export class PhenxLogger {
    static createdPhenxForm = 0;
    static createdPhenxForms = [];

    static samePhenxForm = 0;
    static samePhenxForms = [];

    static changedPhenxForm = 0;
    static changedPhenxForms = [];

    static retiredPhenxForm = 0;
    static retiredPhenxForms = [];
    static retiredPhenxCde = 0;
    static retiredPhenxCdes = [];

    constructor() {
        let timeInterval = 10 * 1000; // 10 seconds
        setInterval(PhenxLogger.log, timeInterval);
    }

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