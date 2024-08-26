import 'server/globals';
import { Client } from '@elastic/elasticsearch';
import { Client as ClientNewType } from '@elastic/elasticsearch/api/new';
import { config } from 'server';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { flattenFormElement } from 'shared/form/fe';

const XLSX = require('xlsx');

const cond = {noRenderAllowed: true, tinyId: {$in:
            // ['QJOUwY4CAM']}};
            ['QJOUwY4CAM','XyWzqt6p8','m1fTbJSrFe','QJV0Kca6U','QJsx6Q8iOt_','7yvWqF6T8']}};

const cdesToBeDeleted: any  = {};
export const esClient: ClientNewType = new Client(config.elastic.options) as any;

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
                name: form.designations[0].designation,
            }],
            classifStewards: getClassifStewards([], cdes),
            regStatus: cdes[0].registrationState.registrationStatus
        }
    }
}

async function isThisCdeUsedOnRenderForm(tinyId: string): Promise<DataElementElastic['linkedForms']['forms'][0] | undefined> {
    const esResult = await esClient.search<DataElementElastic>({
        index: config.elastic.index.name,
        q: `tinyId:${tinyId}`,
    });
    if (!esResult.body.hits.hits[0]._source?.linkedForms) {
        return;
    }
    for (const f of esResult.body.hits.hits[0]._source.linkedForms.forms) {
        if (!f.noRenderAllowed) {
            return f;
        }
    }
}

async function run() {
    await reportForm();
    const csvData: any[] = [];
    console.log('CDEs to be deleted');
    for (const tinyId of Object.keys(cdesToBeDeleted)) {
       const cde = cdesToBeDeleted[tinyId];
       console.log(tinyId);
       console.log(cde.name);
       const renderForm = await isThisCdeUsedOnRenderForm(tinyId);
       console.log('--FORMS--');
       cde.forms.forEach((f: any) => {
           console.log(`  ${f.tinyId} - ${f.name}`)
       });
       console.log('  --CLASSIFIED BY--');
       cde.classifStewards.forEach((st: any) => {
          console.log(`    ${st}`);
       });
        if (renderForm) {
            console.log(`NOT DELETING ${tinyId} because it is part of ${renderForm.tinyId}`);
        } else {
            console.log(`**DELETE** ${tinyId} -- ${cde.name}`);
            await dataElementModel.deleteMany({tinyId})
        }
       csvData.push([tinyId, cde.name, cde.regStatus, cde.forms[0].tinyId, cde.forms[0].name, cde.classifStewards[0],
           renderForm === undefined?'YES':'NO']);
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
    }


    // console.log('--- CDES used outside of NINDS ---');
    // Object.keys(cdesToBeDeleted).forEach(tinyId => {
    //     const cde = cdesToBeDeleted[tinyId];
    //     if (cde.classifStewards.filter((cl: any) => cl !== 'NINDS').length) {
    //         console.log(`CDE ${tinyId} is used by ${cde.classifStewards.join(' ')}`);
    //     }
    // });

    console.log('--- END OF REPORT ---');
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = {Sheets: {data: ws}, SheetNames: ['data']};
    XLSX.utils.sheet_add_aoa(ws, [['CDE ID', 'CDE Name', 'CDE Status', 'Form ID', 'Form Name', 'CDE Classification', 'DELETE']],
        { origin: 'A1' });
    XLSX.writeFile(wb, 'cde_noRender_report.xlsx');

    process.exit(0);
}

run();
