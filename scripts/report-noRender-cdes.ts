import 'server/globals';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { flattenFormElement } from '../shared/form/fe';

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
        console.log('no CDEs');
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
            classifStewards: getClassifStewards([], cdes)
        }
    }
}

async function run() {
    await reportForm();
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
    });
}

run();
