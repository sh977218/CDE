import { updateMeshByClassification } from 'server/mesh/meshDb';
import { getTreePathsAsName } from 'server/mesh/utsMesh';
import { read, utils } from 'xlsx';

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
    const meshRows: MeshCsvRow[] = utils.sheet_to_json(workbook.Sheets['SmallestClassDedup']);
    const unitOfWork: Promise<void>[] = [];
    const reducedMeshRows = meshRows.reduce((accumulator: meshClassification[], currentValue, index) => {
        const existObj = accumulator.filter(
            (a: meshClassification) => a.flatClassification === currentValue.Classification
        )[0];
        if (existObj) {
            existObj.flatTrees.push(...currentValue['Mesh Name']);
            existObj.meshDescriptors.push(...currentValue['Mesh UI']);
        } else {
            unitOfWork.push(
                (async () => {
                    accumulator.push({
                        flatClassification: currentValue.Classification,
                        // flatTrees: [currentValue['Mesh Name']],
                        flatTrees: (await getTreePathsAsName(currentValue['Mesh UI'])).map(path => path.join(';')),
                        meshDescriptors: [currentValue['Mesh UI']],
                    });
                })()
            );
        }
        return accumulator;
    }, []);
    await Promise.all(unitOfWork);
    for (const meshRow of reducedMeshRows) {
        const flatClassification = meshRow.flatClassification;
        const flatTrees = [...new Set(meshRow.flatTrees)];
        const meshDescriptors = [...new Set(meshRow.meshDescriptors)];
        await updateMeshByClassification(flatClassification, flatTrees, meshDescriptors);
    }
}
