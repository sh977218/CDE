const _ = require('lodash');

exports.parseProperties = (measure, protocol) => {
    let properties = [];
    let prop1 = ['Specific Instructions', 'Protocol', 'Protocol Name From Source', 'Selection Rationale', 'Life Stage', 'Language', 'Participant', 'Personnel and Training Required', 'Equipment Needs', 'Mode of Administration', 'Derived Variables', 'Process and Review'];
    _.forEach(prop1, p => {
        let value = protocol[p];
        if (value) {
            properties.push({key: p, value: value.trim(), source: 'PhenX'});
        }
    });

    let prop2 = ['Variables', 'Standards', 'Requirements'];
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
                    td = td + '<td>' + value.trim() + '</td>';
                });
                tr = tr + '<tr>' + td + '</tr>';
            });
            let tbody = '<tr>' + tr + '</tr>';
            let table = "<table class='table table-striped'>" + thead + tbody + "</table>";
            properties.push({key: p.trim(), value: table, valueFormat: "html", source: "PhenX"});
        }
    });


    let prop3 = ["Keywords"];
    _.forEach(prop3, p => {
        let valueArray = measure[p];
        if (!_.isEmpty(valueArray)) {
            valueArray = valueArray.map(v => {
                return v.trim();
            });
            let value = valueArray.join(",");
            properties.push({key: p, value: value, source: "PhenX"});
        }
    });

    return properties;
};