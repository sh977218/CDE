import 'server/globals';
import { getStream } from 'server/mongo/mongoose/dataElement.mongoose';
import * as XLSX from 'xlsx';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function formatPermissibleValues(modelObj: any) {
    const pvs: any[] = modelObj.valueDomain.permissibleValues;
    if (modelObj.valueDomain.datatype === 'Value List') {
        return {
            'Permissible Value (PV) Values': pvs.map(pv => pv.permissibleValue).filter(v => v).join('|'),
            'Permissible Value (PV) Labels': pvs.map(pv => pv.valueMeaningName).filter(v => v).join('|'),
            'Permissible Value (PV) Definitions': pvs.map(pv => pv.valueMeaningDefinition).filter(v => v).join('|'),
            'Permissible Value (PV) Concept Identifiers': pvs.map(pv => pv.valueMeaningCode).filter(v => v).join('|'),
            'Permissible Value (PV) Terminology Sources': pvs.map(pv => pv.codeSystemName).filter(v => v).join('|')
        }
    }
}

function formatNumber(modelObj: any) {
    if (modelObj.valueDomain.datatype === 'Number') {
        return {
            'Unit of Measure': modelObj.valueDomain.uom,
            Minimum: modelObj.valueDomain.datatypeNumber?.minValue,
            Maximum: modelObj.valueDomain.datatypeNumber?.maxValue,
        }
    }
    return {};
}

function parseQuestionText(designations: any[]) {
    return designations.find(d => d.tags.indexOf('Preferred Question Text') > -1)?.designation
        || designations.find(d => d.tags.indexOf('Question Text') > -1)?.designation;
}

function parseReferences(references: any[]) {
    const allRefs: string[] = [];
    let currentRefs: string[] = []

    references.forEach(ref => {
        for (const [key, value] of Object.entries(ref)) {
            currentRefs.push(`${key}: ${value}`)
        }
        allRefs.push(currentRefs.join(', '));
        currentRefs = []
    });
    return allRefs.join('|');
}

function formatProperties(props: any[]) {
    const propObject: any = {};

    props.forEach(p => {
        propObject[p.key] = p.value;
    });

    return propObject;
}

function eltToRow(modelObj: any) {
    return {
        'CDE Name': modelObj.designations[0]?.designation,
        'CDE Data Type': modelObj.valueDomain.datatype,
        'CDE Definition': modelObj.definitions[0]?.definition,
        'Preferred Question Text ': parseQuestionText(modelObj.designations),
        'CDE Source': modelObj.sources.map((s: any) => s.sourceName).join('|'),
        'Data Element Concept (DEC) Identifier': modelObj.dataElementConcept.concepts
            .map((d: any) => `${d.name} (${d.originId})`).join('|'),
        'DEC Concept Terminology Source': modelObj.dataElementConcept.concepts.map((d: any) => d.origin).join('|'),
        'NLM Identifier for NIH CDE Repository': modelObj.tinyId,
        ...formatPermissibleValues(modelObj),
        ...formatNumber(modelObj),
        'Submitting Body': modelObj.stewardOrg.name,
        ...formatProperties(modelObj.properties),
        References: parseReferences(modelObj.referenceDocuments),
    };
}

async function run() {
    const cond = {
        'classification.stewardOrg.name': 'NHLBI',
        'classification.elements.name': 'Sickle Cell Disease',
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false
    };

    const cursor = await getStream(cond);
    const csvData: any[] = [];

    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const row = eltToRow(modelObj);
        csvData.push(row);
    }).then(() => {
        console.log(`Found and processed ${csvData.length} CDEs`);
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'NHLBI.xlsx');
        console.log(`done writing workbook`);
    });
}

run().then(() => {
    console.log('done');
    process.exit(0);
}, err => {
    console.log('err ' + err);
    process.exit(1);
});
