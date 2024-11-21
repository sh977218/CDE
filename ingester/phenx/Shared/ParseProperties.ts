import {capitalize, forEach, forOwn, isEmpty, keys, sortBy, words} from 'lodash';

export function parseProperties(protocol) {
    const properties: any[] = [];

    const protocolHtml = protocol.protocol;
    if (!isEmpty(protocolHtml)) {
        properties.push({key: 'Protocol', value: protocolHtml, valueFormat: 'html', source: 'PhenX'});
    }

    const prop1 = [
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
        const keyArray = words(p);
        const key = keyArray.reduce((accumulator, currentValue) => {
            return accumulator + ' ' + capitalize(currentValue);
        }, '');
        const value = protocol[p];
        if (!isEmpty(value)) {
            properties.push({key: key.trim(), value: value.trim(), source: 'PhenX'});
        }
    });

    const prop2 = ['variables', 'requirements'];
    forEach(prop2, p => {
        const valueArray = protocol[p];
        if (!isEmpty(valueArray)) {
            let th = '';
            forEach(keys(valueArray[0]), head => {
                th = th + '<th>' + head.trim() + '</th>';
            });
            const thead = '<tr>' + th + '</tr>';

            let tr = '';
            forEach(valueArray, valueObj => {
                let td = '';
                forOwn(valueObj, value => {
                    if (!value.trim) {
                        console.log('Something unknow if wrong.');
                        process.exit(1);
                    }
                    td = td + '<td>' + value.trim() + '</td>';
                });
                tr = tr + '<tr>' + td + '</tr>';
            });
            const tbody = '<tr>' + tr + '</tr>';
            const table = "<table class='table table-striped'>" + thead + tbody + '</table>';
            properties.push({key: capitalize(p).trim(), value: table, valueFormat: 'html', source: 'PhenX'});
        }
    });

    const standards = protocol.standards;
    if (!isEmpty(standards)) {
        let tbody = '';
        for (const standard of standards) {
            const tr = '<tr>'
                + '<td>' + standard.Source + '</td>'
                + '<td>' + standard.ID + '</td>'
                + '<td>' + standard.Name + '</td>'
                + '<td>' + standard.Standard + '</td>'
                + '</tr>';
            tbody = tbody + tr;
        }
        const value = "<table class='table table-striped'>"
            + '<tr>'
            + '<th>Source</th>'
            + '<th>ID</th>'
            + '<th>Name</th>'
            + '<th>Standard</th>'
            + '</tr>'
            + tbody + '</table>';
        properties.push({key: 'Standards', value, valueFormat: 'html', source: 'PhenX'});

    }
    return sortBy(properties, ['key']);

}
