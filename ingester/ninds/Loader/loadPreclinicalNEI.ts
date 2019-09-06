import { readdirSync, readFileSync } from 'fs';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsForm';
import { formatRows } from 'ingester/ninds/csv/shared/utility';

const CSV = require('csv');
const XLSX = require('xlsx');

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical + NEI';

function parseOneCSV(fileName: string) {
    return new Promise(resolve => {
        const csvPath = `${FILE_PATH}/${fileName}`;
        const cond = {
            columns: true,
            rtrim: true,
            trim: true,
            relax_column_count: true,
            skip_empty_lines: true,
            skip_lines_with_empty_values: true
        };
        CSV.parse(readFileSync(csvPath), cond, async (err: any, rows: any[]) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                const formattedRows = formatRows(rows);
                resolve({rows: formattedRows, csvFileName: fileName});
            }
        });
    });
}


function parseOneXLSX(fileName: string) {
    const xlsxPath = `${FILE_PATH}/${fileName}`;
    const workbook = XLSX.readFile(xlsxPath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = formatRows(XLSX.utils.sheet_to_json(worksheet));
    return {
        rows,
        csvFileName: fileName
    };
}


async function run() {
    const csvFiles = readdirSync(FILE_PATH);
    const csvFileNames: string[] = csvFiles;
    for (const fName of csvFileNames) {
        let csvResult: any = {};
        if (fName.indexOf('.csv') !== -1) {
            csvResult = await parseOneCSV(fName);
            console.log(`csvFileName: ${fName}.`);
        } else if (fName.indexOf('.xlsx') !== -1) {
            csvResult = parseOneXLSX(fName);
            console.log(`xlsxFileName: ${fName}.`);
        } else {
            console.log('Unknown file type: ' + fName);
            process.exit(1);
        }
        const rows = csvResult.rows;
        const csvFileName = csvResult.csvFileName;
        await loadFormByCsv(rows, csvFileName);
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
