import { isEmpty } from 'lodash';
import { chunkArray } from 'ingester/shared/chunkArray';

function arrayStringToTableWithThreePerRow(array) {
    const chunkedArray = chunkArray(array, 3);
    const tbodyHtml = chunkedArray.map(tr => {
        const tdHtml = tr.map(td => `<td>${td}</td>`).join('');
        return `<tr>${tdHtml}</tr>`;
    }).join('');
    return `<table class="table table-striped">${tbodyHtml}</table>`;
}

function arrayObjectToTableWithThreePerRow(array) {
    const theadHtml = `<thead><tr>${Object.keys(array[0]).map(th => `<th>${th}</th>`).join('')}</tr></thead>`;
    const chunkedArray = chunkArray(array, 3);
    const tbodyHtml = '<tbody>' + chunkedArray.map(tr => {
        const tdHtml = tr.map(td => {
            let temp = '';
            for (const k in td) {
                if (td.hasOwnProperty(k)) {
                    temp += `<td>${td[k]}</td>`;
                }
            }
            return temp;
        }).join('');
        return `<tr>${tdHtml}</tr>`;
    }).join('') + '</tbody>';
    return `<table class="table table-striped">${theadHtml}${tbodyHtml}</table>`;
}

function objectToTable(obj) {
    const theadHtml = `<thead><tr>${Object.keys(obj).map(th => `<th>${th}</th>`).join('')}</tr></thead>`;
    let tbodyHtml = '<tbody><tr>';
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            tbodyHtml += `<td>${obj[key]}</td>`;
        }
    }
    tbodyHtml += '</tr></tbody>';
    return `<table class="table table-striped">${theadHtml}${tbodyHtml}</table>`;
}

export function parseProperties(loinc) {
    const properties: any[] = [];
    const relatedNames = loinc['Related Names'];
    if (!isEmpty(relatedNames)) {
        const table = arrayStringToTableWithThreePerRow(relatedNames);
        properties.push({key: 'Related Names', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const relatedCodes = loinc['Related Codes'];
    if (!isEmpty(relatedCodes)) {
        const table = arrayObjectToTableWithThreePerRow(relatedCodes);
        properties.push({key: 'Related Codes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const fullySpecifiedName = loinc['Fully-Specified Name'];
    if (!isEmpty(fullySpecifiedName)) {
        const table = objectToTable(fullySpecifiedName);
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const basicAttributes = loinc['Basic Attributes'];
    if (!isEmpty(basicAttributes)) {
        const table = objectToTable(basicAttributes);
        properties.push({key: 'Basic Attributes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const hl7Attributes = loinc['HL7 Attributes'];
    if (!isEmpty(hl7Attributes)) {
        const table = objectToTable(hl7Attributes);
        properties.push({key: 'HL7 Attributes', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    const thirdPartyCopyright = loinc['Third Party Copyright'];
    if (!isEmpty(thirdPartyCopyright)) {
        properties.push({
            key: 'Third Party Copyright',
            value: thirdPartyCopyright,
            source: 'LOINC'
        });
    }

    const loincCopyright = loinc['Third Party Copyright'];
    if (loincCopyright) {
        properties.push({
            key: 'LOINC Copyright',
            value: loincCopyright,
            source: 'LOINC'
        });
    }
    return properties;
}
