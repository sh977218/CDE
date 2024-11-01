import 'server/globals';
import { dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { formModel, getStream } from 'server/mongo/mongoose/form.mongoose';
import { iterateFeSync } from 'shared/form/fe';
import { FormQuestion } from 'shared/form/form.model';
const XLSX = require('xlsx');

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function run(options: any){
    const cond = {
        $and: [
            { formElements: {$ne: []} },
            { 'formElements.formElements': {$ne: []} },
            { 'formElements.formElements.label': {$exists: false} },
            { archived: false },
            { 'registrationState.registrationStatus': {$ne: 'Retired'}},
            { 'stewardOrg.name': {$ne: 'TEST'}},
            { 'formElements.formElements.instructions': {$exists: false} },
            { 'formElements.instructions': {$exists: false} },
        ],
    };

    const IGNORE_MISMATCH = [
        'mkK_It4CAz',
        'XJXPKERCG',
        'mJ_PAy4rsm',
        'Xyz_eFUo_tb',
        'm1_5Mu668'
    ];

    const cursor = await getStream(cond);
    const rows: any[] = [];
    let formData: any = {};
    return cursor.eachAsync(async (model) => {
        console.log(`Start Form ${model.tinyId}`);
        const questions: FormQuestion[] = [];
        iterateFeSync(model, undefined, undefined, fe => {
            questions.push(fe);
        });
        formData.tinyId = model.tinyId;
        formData['Questions Count'] = questions.length;
        formData.steward = model.stewardOrg.name;
        formData.changeNote = model.changeNote;
        formData.lastMigrationScript = model.lastMigrationScript;
        formData.historyDepth = 0;
        const reversedHistory = model.history?.slice().reverse();
        let lastForm = await formModel.findOne({_id: reversedHistory[formData.historyDepth]});
        formData.previousLabels = [];
        let oldQuestions: FormQuestion[] = [];
        if (lastForm){
            do{
                oldQuestions = [];
                iterateFeSync(lastForm, undefined, undefined, fe => {
                    oldQuestions.push(fe);
                });
                formData.previousLabels = oldQuestions.map(q=>q.label).filter(l=>l?.trim()).join('|');
                if(formData.previousLabels.length === 0){
                    lastForm = await formModel.findOne({_id: reversedHistory[++formData.historyDepth]});
                }
            } while(formData.previousLabels.length === 0 && lastForm)
            formData['FormId with labels'] = reversedHistory[formData.historyDepth].toString();
            formData.historyDepth = formData.historyDepth + 1;
        }
        else {
            console.log('No previous form.');
        }

        if(oldQuestions.length === questions.length) {
            let hadMismatch = false;
            for (const q of questions) {
                const tinyId = q.question?.cde?.tinyId;
                const oldQ = oldQuestions.find(oq => oq.question?.cde?.tinyId === tinyId);
                if(oldQ){
                    q.label = oldQ.label;
                }
                else{
                    console.log(`No matching old Question was found for question: ${tinyId}`);
                    q.label = q.question?.cde?.name;
                    console.log(q.label);
                    if(!q.label){
                        const cdeCond = {
                            archived: false,
                            tinyId,
                            'registrationState.registrationStatus': {$ne: 'Retired'}
                        };
                        const cde = await dataElementModel.findOne(cdeCond);
                        q.label = cde?.designations?.[0].designation;
                        console.log('Had to search to fill in Label');
                    }
                    hadMismatch = true;
                }
            }
            if(!hadMismatch || IGNORE_MISMATCH.includes(formData.tinyId)) {
                if(options.save){
                    console.log('saving updated form');
                    await model.save();
                }
                else{
                    console.log('Skipping save.')
                }
            }
        }
        else{
            console.log(`Mismatch with current and history for form ${formData['FormId with labels']}`);
        }
        console.log(`End Form ${model.tinyId}`);
        console.log('  ');
        rows.push({...formData});
    }).then(async () => {
        console.log(`done report`);
        const wb: any = {
            SheetNames: ['Report'],
            Sheets: {}
        };
        const sheet = XLSX.utils.json_to_sheet(rows)
        wb.Sheets.Report = sheet;
        await XLSX.writeFile(wb, `${process.env.NODE_ENV}_report.xlsx`);
    });
}

const args = process.argv.slice(2);
const opts = args.reduce((acc: any,curr) => {acc[curr]=true; return acc} ,{});

run(opts).then(() => {
    console.log('done');
    process.exit(0);
}, err => {
    console.log('err ' + err);
    process.exit(1);
});
