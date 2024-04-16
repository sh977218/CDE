import { read, utils } from 'xlsx';
import { updateMeshByClassification } from './meshDb';

type MeshCsvRow = {
    Classification: string;
    'Mesh Name': string;
    'Mesh UI': string;
};

type meshClassification = {
    flatClassification: string;
    flatTrees: string[];
    meshDescriptors: string[];
};

export async function updateMeshMappings(csvFileBuffer: Buffer) {
    const workbook = read(csvFileBuffer);
    const meshRows: MeshCsvRow[] = utils.sheet_to_json(workbook.Sheets['Classifs to MeSH_CSV for demo']);
    const reducedMeshRows = meshRows.reduce((accumulator: meshClassification[], currentValue, index) => {
        const existObj = accumulator.filter(
            (a: meshClassification) => a.flatClassification === currentValue.Classification
        )[0];
        if (existObj) {
            existObj.flatTrees.push(...currentValue['Mesh Name']);
            existObj.meshDescriptors.push(...currentValue['Mesh UI']);
        } else {
            accumulator.push({
                flatClassification: currentValue.Classification,
                flatTrees: [currentValue['Mesh Name']],
                meshDescriptors: [currentValue['Mesh UI']],
            });
        }
        return accumulator;
    }, []);
    for (const meshRow of reducedMeshRows) {
        const flatClassification = meshRow.flatClassification;
        const flatTrees = [...new Set(meshRow.flatTrees)];
        const meshDescriptors = [...new Set(meshRow.meshDescriptors)];
        await updateMeshByClassification(flatClassification, flatTrees, meshDescriptors);
    }
}
