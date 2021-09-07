import { Model } from 'mongoose';
import { DataElementDocument, dataElementModel } from 'server/cde/mongo-cde';
import { isEmpty } from 'lodash';

const XLSX = require('xlsx');

process.on('unhandledRejection', (error) => {
    console.log(error);
});


export function isNotEmpty<T>(o: T) {
    return !isEmpty(o);
}

export function mongoEltToExportElt(elt: any) {
    const results: any[] = [];
    let definition = '';
    if (elt.definitions && elt.definitions[0]) {
        definition = elt.definitions[0].definition
    }
    let pvs = '';
    let codeNames = '';
    let codes = '';
    let codeSystem = '';
    if (elt.valueDomain.datatype === 'Value List') {
        pvs += elt.valueDomain.permissibleValues.map((p: any) => p.permissibleValue).filter(isNotEmpty).join(';');
        codeNames += elt.valueDomain.permissibleValues.map((p: any) => p.valueMeaningName).filter(isNotEmpty).join(';');
        codes += elt.valueDomain.permissibleValues.map((p: any) => p.valueMeaningCode).filter(isNotEmpty).join(';');
        codeSystem += elt.valueDomain.permissibleValues.map((p: any) => p.codeSystemName).filter(isNotEmpty).join(';');
    }
    const questionText = elt.designations.filter((d: any) => d.tags.indexOf('Question Text') > -1)
        .map((n: any) => n.designation)
        .filter(isNotEmpty)
        .join(';');
    const otherNames = elt.designations.filter((d: any) => d.tags.indexOf('Question Text') === -1)
        .map((n: any) => n.designation)
        .filter(isNotEmpty)
        .join(';');
    const dataElementConcept = elt.dataElementConcept.concepts.filter(isNotEmpty)
        .map((n: any) => `name: ${n.name} | origin: ${n.origin} | originId: ${n.originId} `)
        .join(';');
    const objectClass = elt.objectClass.concepts.filter(isNotEmpty)
        .map((n: any) => `name: ${n.name} | origin: ${n.origin} | originId: ${n.originId} `)
        .join(';');
    const property = elt.property.concepts.filter(isNotEmpty)
        .map((n: any) => `name: ${n.name} | origin: ${n.origin} | originId: ${n.originId} `)
        .join(';');

    const usedBy = elt.classification.map((c: any) => c.stewardOrg.name).join(';');
    elt.classification.forEach((c: any) => {
        c.elements.forEach((e: any) => {
            const row = {
                'NLM ID': elt.tinyId,
                Name: elt.designations[0].designation,
                'Question Texts': questionText,
                'Other Names': otherNames,
                'Value Type': elt.valueDomain.datatype,
                Definition: definition,
                'Permissible values': pvs,
                'Code names': codeNames,
                Code: codes,
                'Code system': codeSystem,
                'Nb of Permissible Values': elt.valueDomain.permissibleValues.length,
                'Unit of Measure': elt.valueDomain.uom,
                Steward: elt.stewardOrg.name,
                'Used By': usedBy,
                'Registration Status': elt.registrationState.registrationStatus,
                'Administrative Status': elt.registrationState.administrativeStatus,
                Identifiers: elt.ids.map((i: any) => `${i.source} ${i.id} ${i.version ? i.version : ''}`).join(';'),
                Source: elt.source,
                Updated: elt.updated,
                Org: c.stewardOrg.name,
                Classification: e.name,
                dataElementConcept,
                objectClass,
                property,
                'Basic attributes': elt.properties['Basic Attributes"'],
                'Fully specified name': elt.properties['Fully-Specified Name'],
                'LOINC Copyright': elt.properties['LOINC Copyright'],
                'Related names': elt.properties['Related Names']
            };
            results.push(row);
        })
    })
    return results;
}

async function phenxReport(collection: Model<DataElementDocument>) {
    let csvData: any[] = [];
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'classification.stewardOrg.name': 'PhenX',
        'classification.elements.name': 'Neurology'
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const rows = mongoEltToExportElt(modelObj);
        csvData = csvData.concat(rows);
    }).then(() => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'PhenX Neurology.xlsx');
        console.log('done PhenX');
    });
}

async function neiReport(collection: Model<DataElementDocument>) {
    let csvData: any[] = [];
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'classification.stewardOrg.name': 'NEI',
        'classification.elements.name': 'eyeGENE'
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const rows = mongoEltToExportElt(modelObj);
        csvData = csvData.concat(rows);
    }).then(() => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'NEI eyeGene.xlsx');
        console.log('done NEI');
    });
}

async function nciReport(collection: Model<DataElementDocument>) {
    let csvData: any[] = [];
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'classification.stewardOrg.name': 'NCI',
        'classification.elements.name': 'NCI Preferred Standards'
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const rows = mongoEltToExportElt(modelObj);
        csvData = csvData.concat(rows);
    }).then(() => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = {Sheets: {data: ws}, SheetNames: ['data']};
        XLSX.writeFile(wb, 'NCI Preferred Standard.xlsx');
        console.log('done NCI');
    });
}


async function reportByStatus(status: string) {
    let csvData: any[] = [];
    const cond = {
        'registrationState.registrationStatus': status,
        archived: false,
    };
    const cursor = dataElementModel.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        const rows = _mongoEltToExportElt(modelObj);
        csvData = csvData.concat(rows);
    }).then(() => {
        console.log(`done ${status}`);
        return csvData;
    });
}

async function report() {
    const statuses = ['Preferred Standard', 'Standard', 'Qualified', 'Incomplete', 'Recorded', 'Candidate'];
    const wb: any = {
        SheetNames: statuses,
        Sheets: {}
    };
    for await (const status of statuses) {
        const csvData = await reportByStatus(status)
        const sheet = XLSX.utils.json_to_sheet(csvData)
        wb.Sheets[status] = sheet;
    }
    await XLSX.writeFile(wb, 'report.xlsx');
}

function _mongoEltToExportElt(elt: any) {
    const results: any[] = [];
    elt.classification.forEach((c: any) => {
        c.elements.forEach((e: any) => {
            const row = {
                'NLM ID': elt.tinyId,
                Name: elt.designations[0].designation,
                Status: elt.registrationState.registrationStatus,
                Steward: elt.stewardOrg.name,
                Org: c.stewardOrg.name,
                Classification: e.name,
            };
            results.push(row);
        })
    })
    return results;
}


function run() {
    const tasks = [
        phenxReport(dataElementModel),
        neiReport(dataElementModel),
        nciReport(dataElementModel),
        report()
    ];
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
