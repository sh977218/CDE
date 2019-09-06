import { capitalize, forEach, forOwn, isEmpty, keys, words } from 'lodash';

export function parseProperties(protocol) {
    let properties = [];

    let protocolHtml = protocol.protocol;
    if (!isEmpty(protocolHtml)) {
        properties.push({key: 'Protocol', value: protocolHtml, valueFormat: 'html', source: 'PhenX'});
    }

    let prop1 = [
        'protocolNameFromSource',
        'selectionRationale',
        'lifeStage',
        'language',
        'participants',
        'personnelAndTrainingRequired',
        'equipmentNeeds',
        'modeOfAdministration',
        'derivedVariables',
        'processAndReview',
        'purpose',
        'keywords',
        'source'
    ];
    forEach(prop1, p => {
        let keyArray = words(p);
        let key = keyArray.reduce((accumulator, currentValue) => {
            return accumulator + ' ' + capitalize(currentValue);
        }, '');
        let value = protocol[p];
        if (!isEmpty(value)) {
            properties.push({key: key.trim(), value: value.trim(), source: 'PhenX'});
        }
    });

    let prop2 = ['variables', 'requirements'];
    forEach(prop2, p => {
        let valueArray = protocol[p];
        if (!isEmpty(valueArray)) {
            let th = '';
            forEach(keys(valueArray[0]), head => {
                th = th + '<th>' + head.trim() + '</th>';
            });
            let thead = '<tr>' + th + '</tr>';

            let tr = '';
            forEach(valueArray, valueObj => {
                let td = '';
                forOwn(valueObj, value => {
                    if (!value.trim)
                        debugger;
                    td = td + '<td>' + value.trim() + '</td>';
                });
                tr = tr + '<tr>' + td + '</tr>';
            });
            let tbody = '<tr>' + tr + '</tr>';
            let table = "<table class='table table-striped'>" + thead + tbody + "</table>";
            properties.push({key: capitalize(p).trim(), value: table, valueFormat: "html", source: "PhenX"});
        }
    });

    let standards = protocol.standards;
    if (!isEmpty(standards)) {
        let tbody = '';
        for (let standard of standards) {
            let tr = '<tr>'
                + '<td>' + standard['Source'] + '</td>'
                + '<td>' + standard['ID'] + '</td>'
                + '<td>' + standard['Name'] + '</td>'
                + '<td>' + standard['Standard'] + '</td>'
                + '</tr>';
            tbody = tbody + tr;
        }
        let value = "<table class='table table-striped'>"
            + "<tr>"
            + "<th>Source</th>"
            + "<th>ID</th>"
            + "<th>Name</th>"
            + "<th>Standard</th>"
            + "</tr>"
            + tbody + "</table>";
        properties.push({key: 'Standards', value: value, valueFormat: "html", source: "PhenX"});

    }

    return properties;
}