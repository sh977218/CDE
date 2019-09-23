export class RedcapLogger {
    static createdRedcapCde = 0;
    static createdRedcapCdes: any[] = [];
    static createdRedcapForm = 0;
    static createdRedcapForms: any[] = [];

    static sameRedcapForm = 0;
    static sameRedcapForms: any[] = [];
    static sameRedcapCde = 0;
    static sameRedcapCdes: any[] = [];

    static changedRedcapForm = 0;
    static changedRedcapForms: any[] = [];
    static changedRedcapCde = 0;
    static changedRedcapCdes: any[] = [];

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
    }
}
