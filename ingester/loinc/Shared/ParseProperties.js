exports.parseProperties = function (loinc) {
    var properties = [];
    if (loinc['RELATED NAMES']) {
        var table = '<table class="table table-striped">';
        var tr = '';
        loinc['RELATED NAMES']['RELATED NAMES'].forEach(function (n, i) {
            var j = i % 3;
            var td = '<td>' + n + '</td>';
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
        var ths = '';
        var tds = '';
        Object.keys(loinc['NAME']['NAME']['Fully-Specified Name']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['NAME']['NAME']['Fully-Specified Name'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['BASIC ATTRIBUTES']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }if (loinc['HL7 ATTRIBUTES']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['HL7 ATTRIBUTES']['HL7 ATTRIBUTES']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['HL7 ATTRIBUTES']['HL7 ATTRIBUTES'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'HL7 ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['EXAMPLE UNITS']) {
        var trs = '<tr><th>Source Type</th><th>Unit</th></tr>';
        loinc['EXAMPLE UNITS']['EXAMPLE UNITS'].forEach(function (eu) {
            trs = trs + '<tr><td>' + eu['Source Type'] + '</td><td>' + eu['Unit'] + '</td></tr>';
        });
        var table = '<table class="table table-striped">' + trs + '</table>';
        properties.push({key: 'EXAMPLE UNITS', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['COPYRIGHT']['COPYRIGHT']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['COPYRIGHT']['COPYRIGHT'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT TEXT']) {
        properties.push({
            key: 'LOINC_Copyright',
            value: loinc['COPYRIGHT TEXT']['COPYRIGHT TEXT'],
            source: 'LOINC'
        })
    }
    return properties;
};