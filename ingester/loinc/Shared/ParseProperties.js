exports.parseProperties = function (loinc) {
    let properties = [];
    if (loinc['RELATED NAMES']) {
        let table = '<table class="table table-striped">';
        let tr = '';
        loinc['RELATED NAMES']['RELATED NAMES'].forEach(function (n, i) {
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
    if (loinc['NAME']['NAME']['Fully-Specified Name']) {
        let ths = '';
        let tds = '';
        Object.keys(loinc['NAME']['NAME']['Fully-Specified Name']).forEach(function (key) {
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let value = loinc['NAME']['NAME']['Fully-Specified Name'][key];
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['BASIC ATTRIBUTES']) {
        let ths = '';
        let tds = '';
        Object.keys(loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']).forEach(function (key) {
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let value = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES'][key];
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['HL7 ATTRIBUTES']) {
        let ths = '';
        let tds = '';
        Object.keys(loinc['HL7 ATTRIBUTES']['HL7 ATTRIBUTES']).forEach(function (key) {
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let value = loinc['HL7 ATTRIBUTES']['HL7 ATTRIBUTES'][key];
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'HL7 ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['EXAMPLE UNITS']) {
        let trs = '<tr><th>Source Type</th><th>Unit</th></tr>';
        loinc['EXAMPLE UNITS']['EXAMPLE UNITS'].forEach(function (eu) {
            trs = trs + '<tr><td>' + eu['Source Type'] + '</td><td>' + eu['Unit'] + '</td></tr>';
        });
        let table = '<table class="table table-striped">' + trs + '</table>';
        properties.push({key: 'EXAMPLE UNITS', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT']) {
        let ths = '';
        let tds = '';
        Object.keys(loinc['COPYRIGHT']['COPYRIGHT']).forEach(function (key) {
            let th = '<th>' + key + '</th>';
            ths = ths + th;
            let value = loinc['COPYRIGHT']['COPYRIGHT'][key];
            let td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        let table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT TEXT']) {
        properties.push({
            key: 'LOINC_Copyright',
            value: loinc['COPYRIGHT TEXT']['COPYRIGHT TEXT'],
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