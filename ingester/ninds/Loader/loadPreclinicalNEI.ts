import { readdirSync, readFileSync } from 'fs';
import { sortBy, groupBy } from 'lodash';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsForm';
import { formatRows } from 'ingester/ninds/csv/shared/utility';
import { mergeElt, NINDS_PRECLINICAL_NEI_FILE_PATH } from 'ingester/shared/utility';
import { createNindsCde } from 'ingester/ninds/csv/cde/cde';
import { doOneRow } from 'ingester/ninds/csv/form/ParseFormElements';

const CSV = require('csv');

function parseOneCsv(csvFileName: string): Promise<any> {
    return new Promise(resolve => {
        const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
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
                const rows = formatRows(csvFileName, data);
                resolve({rows, csvFileName});
            }
        });
    });
}

async function loadNindsCde(variablename, rows) {
    const cde = await createNindsCde(rows[0]);
    for (const row of rows) {
        const newCde = await createNindsCde(row);
        mergeElt(cde, newCde, 'NINDS', 'NINDS');
    }
    await doOneRow(cde, variablename);
}

async function loadNindsCdes(cdeRows) {
    const result = groupBy(cdeRows, 'variablename');
    for (const variablename in result) {
        if (result.hasOwnProperty(variablename)) {
            await loadNindsCde(variablename, result[variablename]);
        }
    }
}

async function run() {
    const csvFiles = readdirSync(NINDS_PRECLINICAL_NEI_FILE_PATH);
    const csvFileNames: string[] = sortBy(csvFiles);
    let cdeRows: any[] = [];
    for (const csvFileName of csvFileNames) {
        const csvResult = await parseOneCsv(csvFileName);
        cdeRows = cdeRows.concat(csvResult.rows);
    }
    await loadNindsCdes(cdeRows);

    for (const csvFileName of csvFileNames) {
        const csvResult = await parseOneCsv(csvFileName);
        console.log(`Starting csvFileName: ${csvFileName}.`);
        await loadFormByCsv(csvResult);
        console.log(`Finished csvFileName: ${csvFileName}`);
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
