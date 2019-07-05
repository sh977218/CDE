exports.parseProperties = loinc => {
    if (loinc.loinc) loinc = loinc.loinc;
    let properties = [];
    if (loinc['RELATED NAMES']) {
        let table = '<table class="table table-striped">';
        let tr = '';
        loinc['RELATED NAMES'].forEach((n, i) => {
            let j = i % 3;
            let td = '<td>' + n + '</td>';
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
        properties.push({key: 'RELATED NAMES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['NAME'] && loinc['NAME']['Fully-Specified Name']) {
        let ths = '';
        let tds = '';
        for (let key in loinc['NAME']['Fully-Specified Name']) {
            let value = loinc['NAME']['Fully-Specified Name'][key];
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        }
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['BASIC ATTRIBUTES']) {
        let ths = '';
        let tds = '';
        for (let key in loinc['BASIC ATTRIBUTES']) {
            let value = loinc['BASIC ATTRIBUTES'][key];
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        }
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['HL7 ATTRIBUTES']) {
        let ths = '';
        let tds = '';
        for (let key in loinc['HL7 ATTRIBUTES']) {
            let value = loinc['HL7 ATTRIBUTES'][key];
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        }
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'HL7 ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['EXAMPLE UNITS']) {
        let trs = '<tr><th>Source Type</th><th>Unit</th></tr>';
        loinc['EXAMPLE UNITS'].forEach(eu => {
            trs = trs + '<tr><td>' + eu['Source Type'] + '</td><td>' + eu['Unit'] + '</td></tr>';
        });
        let table = '<table class="table table-striped">' + trs + '</table>';
        properties.push({key: 'EXAMPLE UNITS', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT']) {
        let ths = '';
        let tds = '';
        for (let key in loinc['COPYRIGHT']) {
            let value = loinc['COPYRIGHT'][key];
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        }
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT TEXT']) {
        properties.push({
            key: 'LOINC_Copyright',
            value: loinc['COPYRIGHT TEXT'],
            source: 'LOINC'
        })
    }
    if (loinc['COPYRIGHT NOTICE']) {
        properties.push({
            key: 'LOINC_Copyright_Notice',
            value: loinc['COPYRIGHT NOTICE'],
            source: 'LOINC'
        })
    }
    if (loinc['3rd PARTY COPYRIGHT']) {
        properties.push({
            key: 'LOINC_3rd_Party_Copyright',
            value: loinc['3rd PARTY COPYRIGHT'],
            source: 'LOINC'
        })
    }
    return properties;
};