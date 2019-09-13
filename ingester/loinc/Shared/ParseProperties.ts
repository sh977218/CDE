const tableify = require('tableify');

export function parseProperties(loinc) {
    const properties: any[] = [];
    const relatedNames = loinc['Related Names'];
    if (relatedNames) {
        let table = '<table class="table table-striped">';
        let tr = '';
        relatedNames.forEach((n, i) => {
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
        properties.push({key: 'Related Names', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const relatedCodes = loinc['Related Codes'];
    if (relatedCodes) {
        const table = tableify(relatedCodes, {classes: false});
        properties.push({key: 'Related Codes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const fullySpecifiedName = loinc['Fully-Specified Name'];
    if (fullySpecifiedName) {
        let ths = '';
        let tds = '';
        for (const key in fullySpecifiedName) {
            if (fullySpecifiedName.hasOwnProperty(key)) {
                const value = fullySpecifiedName[key];
                const th = '<th>' + key + '</th>';
                ths = ths + th;
                const td = '<td>' + value + '</td>';
                tds = tds + td;
            }
        }
        const table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const basicAttributes = loinc['Basic Attributes'];
    if (basicAttributes) {
        let ths = '';
        let tds = '';
        for (const key in basicAttributes) {
            if (basicAttributes.hasOwnProperty(key)) {
                const value = basicAttributes[key];
                const th = '<th>' + key + '</th>';
                ths = ths + th;
                const td = '<td>' + value + '</td>';
                tds = tds + td;
            }
        }
        const table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Basic Attributes', value: table, source: 'LOINC', valueFormat: 'html'});
    }

    const hl7Attributes = loinc['HL7 Attributes'];
    if (hl7Attributes) {
        let ths = '';
        let tds = '';
        for (const key in hl7Attributes) {
            if (hl7Attributes.hasOwnProperty(key)) {
                const value = hl7Attributes[key];
                const th = '<th>' + key + '</th>';
                ths = ths + th;
                const td = '<td>' + value + '</td>';
                tds = tds + td;
            }
        }
        const table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
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

    if (loinc['LOINC Copyright']) {
        properties.push({
            key: 'LOINC Copyright',
            value: loinc['LOINC Copyright'],
            source: 'LOINC'
        });
    }
    return properties;
}
