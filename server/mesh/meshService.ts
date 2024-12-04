import { parse } from 'csv-parse';
import { count, updateMeshByClassification } from 'server/mesh/meshDb';
import { getTreePathsAsName } from 'server/mesh/utsMesh';
import { concat } from 'shared/array';
import {
    XLS_SHEET_COLUMN_CLASSIFICATION,
    XLS_SHEET_COLUMN_UI_CODE,
    XLS_SHEET_NAME
} from 'shared/mesh/meshMappingFileConstants';
import { promisify } from 'util';
import { read, utils } from 'xlsx';

// MeshExcelRow is dependent on meshMappingFileConstants and TS will enforce update
interface MeshExcelRow {
    Classification: string;
    // 'Mesh Name': string;
    'MeSH Mapping UI': string;
}

interface meshClassification {
    flatClassification: string;
    flatTrees: string[];
    meshDescriptors: string[];
}

export async function updateMeshMappingsCsv(csvFileBuffer: Buffer) {
    return promisify<Buffer, [string, string][]>(parse)(csvFileBuffer)
        .then(data => processMeshMapping(data));
}

export async function updateMeshMappingsXls(xlsFileBuffer: Buffer) {
    const workbook = read(xlsFileBuffer);
    const meshRows: MeshExcelRow[] = utils.sheet_to_json(workbook.Sheets[XLS_SHEET_NAME]);
    return processMeshMapping(meshRows.map(row => [row[XLS_SHEET_COLUMN_CLASSIFICATION], row[XLS_SHEET_COLUMN_UI_CODE]]));
}

async function processMeshMapping(rows: [classification: string, descriptors: string][]) {
    const unitOfWork: Promise<void>[] = [];
    const reducedMeshRows = rows.reduce((accumulator: meshClassification[], row, index) => {
        if (!row[0]) {
            console.log(row)
            throw 'bad data';
        }
        if (!row[1]) {
            return accumulator;
        }
        const flatClassification = row[0];
        const descriptorCodes = row[1].split(';');
        unitOfWork.push(
            (async () => {
                const existingClassification = accumulator.filter(
                    (a: meshClassification) => a.flatClassification === flatClassification
                )[0];
                const listOfListOfTrees = await Promise.all(
                    descriptorCodes.map(getTreePathsAsName)
                );
                const flatTrees = concat(...listOfListOfTrees).map(path => path.join(';'));
                if (existingClassification) {
                    // existObj.flatTrees.push(...currentValue['Mesh Name']);
                    flatTrees.forEach(flatTree => existingClassification.flatTrees.push(flatTree));
                    descriptorCodes.forEach(descriptorCode => existingClassification.meshDescriptors.push(descriptorCode));
                } else {
                    accumulator.push({
                        flatClassification,
                        flatTrees,
                        meshDescriptors: descriptorCodes,
                    });
                }
            })()
        );
        return accumulator;
    }, []);
    await Promise.all(unitOfWork);
    for (const meshRow of reducedMeshRows) {
        const flatClassification = meshRow.flatClassification;
        const flatTrees = [...new Set(meshRow.flatTrees)];
        const meshDescriptors = [...new Set(meshRow.meshDescriptors)];
        await updateMeshByClassification(flatClassification, flatTrees, meshDescriptors);
    }
    return [rows.length, await count({})];
}
