import { readdirSync, readFileSync } from 'fs';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsForm';
import { formatRows } from 'ingester/ninds/csv/shared/utility';

const CSV = require('csv');

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical + NEI/10-7-2019/';

function parseOneCsv(csvFileName: string) {
    return new Promise(resolve => {
        const csvPath = `${FILE_PATH}/${csvFileName}`;
        const cond = {
            columns: true,
            rtrim: true,
            trim: true,
            relax_column_count: true,
            skip_empty_lines: true,
            skip_lines_with_empty_values: true
        };
        CSV.parse(readFileSync(csvPath), cond, (err: any, data: any[]) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                const rows = formatRows(data);
                resolve({rows, csvFileName});
            }
        });
    });
}

async function run() {
    const csvFiles = readdirSync(FILE_PATH);
    const csvFileNames: string[] = csvFiles;
    let i = 0;
    for (const csvFileName of csvFileNames) {
        const isCsv = csvFileName.indexOf('.csv') !== -1;
        if (isCsv) {
            const csvResult = await parseOneCsv(csvFileName);
            console.log(`Starting csvFileName: ${csvFileName}.`);
            await loadFormByCsv(csvResult);
            console.log(`Finished csvFileName: ${csvFileName} ${i}`);
        } else {
            console.log('Unknown file type: ' + csvFileName);
            process.exit(1);
        }
        i++;
    }
}


run().then(
    result => {
        console.log(result);
        console.log('Finished all ninds csv.');
        process.exit(0);
    },
    err => {
        console.log(err);
        process.exit(1);
    }
);
