export class RedcapLogger {
    static createdRedcapCde = 0;
    static createdRedcapCdes = [];
    static createdRedcapForm = 0;
    static createdRedcapForms = [];

    static sameRedcapForm = 0;
    static sameRedcapForms = [];
    static sameRedcapCde = 0;
    static sameRedcapCdes = [];

    static changedRedcapForm = 0;
    static changedRedcapForms = [];
    static changedRedcapCde = 0;
    static changedRedcapCdes = [];

    static retiredRedcapForm = 0;
    static retiredRedcapForms = [];
    static retiredRedcapCde = 0;
    static retiredRedcapCdes = [];

    constructor() {
        const timeInterval = 10 * 1000; // 10 seconds
        setInterval(RedcapLogger.log, timeInterval);
    }

    static log() {
        console.log('createdRedcapCde: ' + this.createdRedcapCde);
        console.log('createdRedcapCdes: ' + this.createdRedcapCdes);
        console.log('createdRedcapForm: ' + this.createdRedcapForm);
        console.log('createdRedcapForms: ' + this.createdRedcapForms);

        console.log('sameRedcapCde: ' + this.sameRedcapCde);
        console.log('sameRedcapCdes: ' + this.sameRedcapCdes);
        console.log('sameRedcapForm: ' + this.sameRedcapForm);
        console.log('sameRedcapForms: ' + this.sameRedcapForms);

        console.log('changedRedcapCde: ' + this.changedRedcapCde);
        console.log('changedRedcapCdes: ' + this.changedRedcapCdes);
        console.log('changedRedcapForm: ' + this.changedRedcapForm);
        console.log('changedRedcapForms: ' + this.changedRedcapForms);

        console.log('retiredRedcapCde: ' + this.retiredRedcapCde);
        console.log('retiredRedcapCdes: ' + this.retiredRedcapCdes);
        console.log('retiredRedcapForm: ' + this.retiredRedcapForm);
        console.log('retiredRedcapForms: ' + this.retiredRedcapForms);
    }
}
