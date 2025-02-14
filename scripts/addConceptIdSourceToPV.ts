import 'server/globals';
import { dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { PermissibleValue, PermissibleValueCodeSystem } from 'shared/models.model';
import { readFile, utils } from 'xlsx';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

type Row = any;

async function doCollection(rows: Row, classificationStewardOrg: string) {
    for (const row of rows) {
        const cdeName = row['CDE Name'].trim();
        const cond = {
            'designations.designation': cdeName,
            'classification.stewardOrg.name': classificationStewardOrg,
            archived: false
        };
        const cdes = await dataElementModel.find(cond);
        if (cdes.length === 0) {
            throw new Error(`${cdeName} not found.`);
        } else if (cdes.length > 1) {
            throw new Error(`${cdeName} multiple found.`);
        } else {
            const cde = cdes[0];
            const cdeObject = cde.toObject() as any;
            const pv = parsePermissibleValue(row);
            if (!pv.length) {
                throw new Error(`${cdeName} pv is empty.`);
            }
            cdeObject.valueDomain.permissibleValues = pv;
            cde.valueDomain = cdeObject.valueDomain;
            await cde.save().catch(e => {
                console.log(`${cdeName} has error. ${e}`);
            });
        }
    }
}


function cleanUpRow(row: Row) {
    const cdeNameArray = row['CDE Name'].split('-');
    if (cdeNameArray[1]) {
        row['CDE Name'] = cdeNameArray[1].trim();
    }
}

function cleanUpRows(rows: Row[]) {
    for (const row of rows) {
        cleanUpRow(row);
    }
}

export function parseArray(text: string): string[] {
    if (!text) {
        return [];
    }
    return text.split('|').map(t => t.trim()).filter(t => t);
}

export function parsePermissibleValue(row: Row): PermissibleValue[] {
    const permissibleValueArray = parseArray(row['Permissible Value (PV) Labels']);
    const valueMeaningDefinitionArray = parseArray(row['Permissible Value (PV) Definitions']);

    const conceptIdArray = parseArray(row['Permissible Value (PV) \nConcept Identifiers']);
    const conceptSource = parseArray(row['Permissible Value (PV) Terminology Sources']);

    const valueMeaningCodeArray = parseArray(row['Codes for Permissible Value']);
    const codeSystemName = parseArray(row['Permissible Value \nCode Systems']);

    if (permissibleValueArray.length !== valueMeaningDefinitionArray.length
        || valueMeaningDefinitionArray.length !== conceptIdArray.length) {
        console.log(`pv length not same.`);
    }

    return permissibleValueArray.map((pv: any, i) => ({
        permissibleValue: permissibleValueArray[i],
        valueMeaningDefinition: valueMeaningDefinitionArray[i],
        valueMeaningCode: valueMeaningCodeArray ? valueMeaningCodeArray[i] : '',
        codeSystemName: (codeSystemName
            ? (codeSystemName[i] ? codeSystemName[i] : codeSystemName[0])
            : '') as PermissibleValueCodeSystem,
        conceptId: conceptIdArray[i],
        conceptSource: conceptSource ? conceptSource[0] : '',
    }));
}


async function run() {
    const workbook1 = readFile('C:/Users/huangs8/Downloads/Project 5.csv');
    const workbook2 = readFile('C:/Users/huangs8/Downloads/NHLBI CONNECTS.csv');
    const project5Rows = utils.sheet_to_json<Row>(workbook1.Sheets.Sheet1);
    const nhlbiRows = utils.sheet_to_json<Row>(workbook2.Sheets.Sheet1);
    cleanUpRows(nhlbiRows);

    await doCollection(project5Rows.filter(o => o['CDE Data Type'] === 'Value List'), 'Project 5 (COVID-19)');
    await doCollection(nhlbiRows.filter(o => o['CDE Data Type'] === 'Value List'), 'NHLBI');
}

run().then(() => {
    console.log('done all collections');
    process.exit(0);
}, err => {
    console.log('err ' + err);
    process.exit(1);
});
