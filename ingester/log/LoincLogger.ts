export class LoincLogger {
    static createdLoincCde = 0;
    static createdLoincCdes = [];
    static createdLoincForm = 0;
    static createdLoincForms = [];

    static sameLoincCde = 0;
    static sameLoincCdes = [];
    static sameLoincForm = 0;
    static sameLoincForms = [];

    static changedLoincCde = 0;
    static changedLoincCdes = [];
    static changedLoincForm = 0;
    static changedLoincForms = [];

    static retiredLoincForm = 0;
    static retiredLoincForms = [];
    static retiredLoincCde = 0;
    static retiredLoincCdes = [];

    constructor() {
        let timeInterval = 10 * 1000; // 10 seconds
        setInterval(LoincLogger.log, timeInterval);
    }

    static log() {
        console.log('createdLoincCde: ' + this.createdLoincCde);
        console.log('createdLoincCdes: ' + this.createdLoincCdes);
        console.log('createdLoincForm: ' + this.createdLoincForm);
        console.log('createdLoincForms: ' + this.createdLoincForms);

        console.log('sameLoincCde: ' + this.sameLoincCde);
        console.log('sameLoincCdes: ' + this.sameLoincCdes);
        console.log('sameLoincForm: ' + this.sameLoincForm);
        console.log('sameLoincForms: ' + this.sameLoincForms);

        console.log('changedLoincCde: ' + this.changedLoincCde);
        console.log('changedLoincCdes: ' + this.changedLoincCdes);
        console.log('changedLoincForm: ' + this.changedLoincForm);
        console.log('changedLoincForms: ' + this.changedLoincForms);

        console.log('retiredLoincCde: ' + this.retiredLoincCde);
        console.log('retiredLoincCdes: ' + this.retiredLoincCdes);
        console.log('retiredLoincForm: ' + this.retiredLoincForm);
        console.log('retiredLoincForms: ' + this.retiredLoincForms);
    }
}