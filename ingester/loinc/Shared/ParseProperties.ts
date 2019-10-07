function arrayStringToTableWithThreePerRow(array) {
    let table = '<table class="table table-striped">';
    let tr = '';
    array.forEach((n, i) => {
        const j = i % 3;
        const td = '<td>' + n + '</td>';
        if (j === 0) {
            tr = '<tr>' + td;
        } else if (j === 1) {
            tr = tr + td;
        } else {
            tr = tr + td + '</tr>';
            table = table + tr;
        }
    });
    table = table + '</table>';
    return table;
}

function objectToTable(obj) {
    let ths = '';
    let tds = '';
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const th = '<th>' + key + '</th>';
            ths = ths + th;
            const td = '<td>' + value + '</td>';
            tds = tds + td;
        }
    }
    const table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
    return table;
}

export function parseProperties(loinc) {
    const properties: any[] = [];
    const relatedNames = loinc['Related Names'];
    if (relatedNames) {
        const table = arrayStringToTableWithThreePerRow(relatedNames);
        properties.push({key: 'Related Names', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const relatedCodes = loinc['Related Codes'];
    if (relatedCodes) {
        const table = arrayStringToTableWithThreePerRow(relatedCodes);
        properties.push({key: 'Related Codes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const fullySpecifiedName = loinc['Fully-Specified Name'];
    if (fullySpecifiedName) {
        const table = objectToTable(fullySpecifiedName);
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const basicAttributes = loinc['Basic Attributes'];
    if (basicAttributes) {
        const table = objectToTable(basicAttributes);
        properties.push({key: 'Basic Attributes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const hl7Attributes = loinc['HL7 Attributes'];
    if (hl7Attributes) {
        const table = objectToTable(hl7Attributes);
        properties.push({key: 'HL7 Attributes', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    const thirdPartyCopyright = loinc['Third Party Copyright'];
    if (thirdPartyCopyright) {
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
