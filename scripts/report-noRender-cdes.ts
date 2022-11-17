import 'server/globals';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { flattenFormElement } from '../shared/form/fe';
const XLSX = require('xlsx');

const cond = {noRenderAllowed: true};

const cdesToBeDeleted: any  = {};

async function reportForm() {
    const forms: any = await formModel.find(cond);
    console.log(`${forms.length} forms`);
    for (const form of forms) {
        const questions = flattenFormElement(form);
        for (const question of questions) {
            if (question.question) {
                const tinyId = question.question.cde.tinyId;
                addToCdesToBeDeleted(form, await dataElementModel.find({tinyId}));
            }
        }
    }

}

function getClassifStewards(existingStewards: any, cdes: any) {
    const stewards: any = new Set(existingStewards);
    cdes.forEach((cde: any) => {
       cde.classification.forEach((classif: any) => {
           stewards.add(classif.stewardOrg.name);
       });
    });
    return Array.from(stewards);
}

function addToCdesToBeDeleted(form: any, cdes: any) {
    if (!cdes[0]) {
        return;
    }
    const cdeTinyId = cdes[0].tinyId;
    if (cdesToBeDeleted[cdeTinyId]) {
        const existingRecord: any = cdesToBeDeleted[cdeTinyId];
        if (!existingRecord.forms.filter((f: any) => f.tinyId === form.tinyId).length) {
            existingRecord.forms.push({
                tinyId: form.tinyId,
                name: form.designations[0].designation
            });
        }
        existingRecord.classifStewards = getClassifStewards(existingRecord.classifStewards, cdes);
    } else {
        cdesToBeDeleted[cdeTinyId] = {
            name: cdes[0].designations[0].designation,
            forms: [{
                tinyId: form.tinyId,
                name: form.designations[0].designation
            }],
            classifStewards: getClassifStewards([], cdes),
            regStatus: cdes[0].registrationState.registrationStatus
        }
    }
}

async function run() {
    await reportForm();
    const csvData: any[] = [];
    console.log('CDEs to be deleted');
    Object.keys(cdesToBeDeleted).forEach(tinyId => {
       const cde = cdesToBeDeleted[tinyId];
       console.log(tinyId);
       console.log(cde.name);
       console.log('--FORMS--');
       cde.forms.forEach((f: any) => {
           console.log(`  ${f.tinyId} - ${f.name}`)
       });
       console.log('  --CLASSIFIED BY--');
       cde.classifStewards.forEach((st: any) => {
          console.log(`    ${st}`);
       });
       csvData.push([tinyId, cde.name, cde.regStatus, cde.forms[0].tinyId, cde.forms[0].name, cde.classifStewards[0]]);
       let i = 1;
       while(cde.forms[i] || cde.classifStewards[i]) {
            const newRow: string[] = ['', ''];
            if (cde.forms[i]) {
                newRow[3] = cde.forms[i].tinyId;
                newRow[4] = cde.forms[i].name;
            }
            if (cde.classifStewards[i]) {
                newRow[5] = cde.classifStewards[i];
                console.log(cde.classifStewards[i])
            }
            csvData.push(newRow);
            i++;
       }
    });

    console.log('--- CDES used outside of NINDS ---');
    Object.keys(cdesToBeDeleted).forEach(tinyId => {
        const cde = cdesToBeDeleted[tinyId];
        if (cde.classifStewards.filter((cl: any) => cl !== 'NINDS').length) {
            console.log(`CDE ${tinyId} is used by ${cde.classifStewards.join(' ')}`);
        }
    });

    console.log('--- END OF REPORT ---');
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = {Sheets: {data: ws}, SheetNames: ['data']};
    XLSX.utils.sheet_add_aoa(ws, [['CDE ID', 'CDE Name', 'CDE Status', 'Form ID', 'Form Name', 'CDE Classification']],
        { origin: "A1" });
    XLSX.writeFile(wb, 'cde_noRender_report.xlsx');

    process.exit(0);
}

run();
