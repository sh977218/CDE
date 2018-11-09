const _ = require('lodash');

exports.parseProperties = (measure, protocol) => {
    let properties = [];

    let protocolHtml = protocol['Protocol'];
    properties.push({key: 'Protocol', value: protocolHtml, valueFormat: 'html', source: 'PhenX'});


    let prop1 = ['Specific Instructions', 'Protocol Name From Source', 'Selection Rationale', 'Life Stage', 'Language', 'Participant', 'Personnel and Training Required', 'Equipment Needs', 'Mode of Administration', 'Derived Variables', 'Process and Review'];
    _.forEach(prop1, p => {
        let value = protocol[p];
        if (value) {
            properties.push({key: p, value: value.trim(), source: 'PhenX'});
        }
    });

    let prop2 = ['Variables', 'Requirements'];
    _.forEach(prop2, p => {
        let valueArray = protocol[p];
        if (!_.isEmpty(valueArray)) {
            let th = '';
            _.forEach(_.keys(valueArray[0]), head => {
                th = th + '<th>' + head.trim() + '</th>';
            });
            let thead = '<tr>' + th + '</tr>';

            let tr = '';
            _.forEach(valueArray, valueObj => {
                let td = '';
                _.forOwn(valueObj, value => {
                    if (!value.trim)
                        debugger;
                    td = td + '<td>' + value.trim() + '</td>';
                });
                tr = tr + '<tr>' + td + '</tr>';
            });
            let tbody = '<tr>' + tr + '</tr>';
            let table = "<table class='table table-striped'>" + thead + tbody + "</table>";
            properties.push({key: p.trim(), value: table, valueFormat: "html", source: "PhenX"});
        }
    });

    let standards = protocol['Standards'];
    if (!_.isEmpty(standards)) {
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

    let keywords = measure['Keywords'];
    if (!_.isEmpty(keywords)) {
        let value = keywords.map(v => v.trim()).join(",");
        properties.push({key: 'Keywords', value: value, source: "PhenX"});
    }

    return properties;
};