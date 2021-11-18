import 'server/globals';
import { dataElementModel } from 'server/cde/mongo-cde';
import { isEmpty } from 'lodash';
import { formModel } from 'server/form/mongo-form';

const XLSX = require('xlsx');

process.on('unhandledRejection', (error) => {
    console.log(error);
});


export function isNotEmpty<T>(o: T) {
    return !isEmpty(o);
}

const cond = {archived: false};

function eltToRow(modelObj: any) {
    const row = {
        tinyID: modelObj.tinyId,
        Sources: modelObj.sources.map((s: any) => s.sourceName).join(';'),
        Source: modelObj.source,
        Steward: modelObj.stewardOrg.name,
        'Used By': modelObj.classification.map((c: any) => c.stewardOrg.name).join(';')
    }
    return row;
}

async function reportDataElement() {
    const csvData: any[] = [];
    const cursor = dataElementModel.find(cond).cursor();
    return cursor.eachAsync(async (model: any) => {
        const modelObj = model.toObject();
        const row = eltToRow(modelObj);
        csvData.push(row);
    }).then(() => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'data element.xlsx');
        console.log(`done data element`);
    });
}

async function reportForm() {
    const csvData: any[] = [];
    const cursor = formModel.find(cond).cursor();
    return cursor.eachAsync(async (model: any) => {
        const modelObj = model.toObject();
        const row = eltToRow(modelObj);
        csvData.push(row);
    }).then(() => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'form.xlsx');
        console.log(`done form`);
    });
}


function run() {
    console.log('start run script');
    const tasks = [
        reportDataElement(),
        reportForm()
    ];
    Promise.all(tasks).then(() => {
        console.log('finished running script');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
