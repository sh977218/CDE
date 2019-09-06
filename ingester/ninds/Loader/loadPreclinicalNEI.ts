import { readdirSync, readFileSync } from 'fs';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsForm';
import { toLower, words } from 'lodash';

const csv = require('csv');

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical + NEI';

function parseOneCsv(csvFileName) {
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
        csv.parse(readFileSync(csvPath), cond, async (err, rows) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                const formattedRows = formatRows(rows);
                resolve({rows: formattedRows, csvFileName});
            }
        });
    });
}

function formatRows(rows) {
    const formattedRows = [];
    rows.forEach(row => {
        const formattedRow = {};
        for (const p in row) {
            const formattedP = words(toLower(p)).join('');
            formattedRow[formattedP] = row[p];
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

async function run() {
    const csvFiles = readdirSync(FILE_PATH);
    for (const csvFileName of csvFiles) {
        if (csvFileName.indexOf('.csv') !== -1) {
            const csvResult = await parseOneCsv(csvFileName);
            console.log(`csvFileName: ${csvFileName}.`);
            await loadFormByCsv(csvResult);
        }
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
