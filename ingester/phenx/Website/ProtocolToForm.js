let _ = require('lodash');

let mongo_data = require('../../../modules/system/node-js/mongo-data');
let classificationShare = require('../../../modules/system/shared/classificationShared');
let updateShare = require('../../updateShare');

let importDate = new Date().toJSON();

exports.protocolToForm = function (protocol) {
    let classificationLength = protocol['classification'].length;
    let form = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NLM'
        },
        created: new Date(),
        updated: new Date(),
        imported: new Date(),
        origin: protocol['Source'],
        naming: [{
            designation: protocol['classification'][classificationLength - 1],
            source: 'PhenX',
            tags: [{tag: ''}]
        }, {
            designation: protocol['Protocol Name From Source'],
            source: 'PhenX',
            definition: protocol['Description of Protocol'],
            tags: [{tag: ''}]
        }],
        sources: [{
            sourceName: 'PhenX',
            created: protocol['Protocol Release Date']
        }],
        registrationState: {
            registrationStatus: "Candidate",
            effectiveDate: protocol['Protocol Release Date']
        },
        properties: [],
        referenceDocuments: [{
            document: protocol['General References'],
            source: 'PhenX'
        }],
        ids: [{source: 'PhenX', id: protocol['protocolId']}],
        classification: [],
        formElements: []
    };
    if (protocol['classification']) {
        classificationShare.classifyItem(form, 'PhenX', protocol['classification']);
    }
    if (protocol['Protocol Name From Source']) {
        form.properties.push({
            key: 'Protocol Name From Source',
            value: protocol['Protocol Name From Source'],
            source: 'PhenX'
        });
    }
    if (protocol['Specific Instructions']) {
        form.properties.push({
            key: 'Specific Instructions',
            value: protocol['Specific Instructions'],
            source: 'PhenX'
        });
    }
    if (protocol['Protocol']) {
        form.properties.push({
            key: 'Protocol',
            value: protocol['Protocol'],
            source: 'PhenX'
        });
    }
    if (protocol['Selection Rationale']) {
        form.properties.push({
            key: 'Selection Rationale',
            value: protocol['Selection Rationale'],
            source: 'PhenX'
        });
    }
    if (protocol['Life Stage']) {
        form.properties.push({
            key: 'Life Stage',
            value: protocol['Life Stage'],
            source: 'PhenX'
        });
    }
    if (protocol['Language']) {
        form.properties.push({
            key: 'Language',
            value: protocol['Language'],
            source: 'PhenX'
        });
    }
    if (protocol['Participant']) {
        form.properties.push({
            key: 'Participant',
            value: protocol['Participant'],
            source: 'PhenX'
        });
    }
    if (protocol['Personnel and Training Required']) {
        form.properties.push({
            key: 'Personnel and Training Required',
            value: protocol['Personnel and Training Required'],
            source: 'PhenX'
        });
    }
    if (protocol['Equipment Needs']) {
        form.properties.push({
            key: 'Equipment Needs',
            value: protocol['Equipment Needs'],
            source: 'PhenX'
        });
    }
    if (protocol['Mode of Administration']) {
        form.properties.push({
            key: 'Mode of Administration',
            value: protocol['Mode of Administration'],
            source: 'PhenX'
        });
    }
    if (protocol['Derived Variables']) {
        form.properties.push({
            key: 'Derived Variables',
            value: protocol['Derived Variables'],
            source: 'PhenX'
        });
    }
    if (protocol['Process and Review']) {
        form.properties.push({
            key: 'Process and Review',
            value: protocol['Process and Review'],
            source: 'PhenX'
        });
    }
    if (protocol['Variables'] && protocol['Variables'].length > 0) {
        let ths = '<tr><th>Variable Name</th><th>Variable ID</th><th>Variable Description</th><th>Version</th><th>Mapping</th></tr>';
        let tbody = '';
        protocol['Variables'].forEach((v) => {
            tbody += '<tr><td>' + v['Variable Name'] + '</td><td>' + v['Variable ID'] + '</td><td>' + v['Variable Description'] + '</td><td>' + v['Version'] + '</td><td>' + v['Mapping'] + '</td></tr>';
        });
        form.properties.push({
            key: 'Variables',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html',
            source: 'PhenX'
        });
    }
    if (protocol['Standards'] && protocol['Standards'].length > 0) {
        let ths = '<tr><th>Standard</th><th>Name</th><th>ID</th><th>Source</th></tr>';
        let tbody = '';
        protocol['Standards'].forEach((s) => {
            tbody += '<tr><td>' + s['Standard'] + '</td><td>' + s['Name'] + '</td><td>' + s['ID'] + '</td><td>' + s['Source'] + '</td></tr>';
        });
        form.properties.push({
            key: 'Standards',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html',
            source: 'PhenX'
        });
    }
    if (protocol['Requirements'] && protocol['Requirements'].length > 0) {
        let ths = '<tr><th>Requirement Category</th><th>Required</th></tr>';
        let tbody = '';
        protocol['Requirements'].forEach((r) => {
            tbody += '<tr><td>' + r['Requirement Category'] + '</td><td>' + r['Required'] + '</td></tr>';
        });
        form.properties.push({
            key: 'Requirements',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html',
            source: 'PhenX'
        });
    }

    return form;
};


function createNaming(form, protocol) {
    let classification = protocol.get('classification');
    let protocolName = classification[classification.length - 1];
    let descriptionOfProtocol = protocol.get('Description of Protocol').trim();
    if (protocolName || descriptionOfProtocol) {
        form.naming = [{
            designation: protocolName,
            definition: descriptionOfProtocol,
            languageCode: "EN-US",
            tags: [],
            source: 'PhenX'
        }];
    }
}

function createSources(form, protocol) {
    let protocolReleaseDate = protocol.get('Protocol Release Date').trim();
    if (protocolReleaseDate)
        form.sources = [{
            sourceName: 'PhenX',
            updated: protocolReleaseDate,
            copyright: {
                valueFormat: "html",
                value: "<a href='http://www.phenxtoolkit.org' target='_blank'>Terms of Use</a>"
            }
        }];
}

function createIds(form, protocol) {
    let formId = protocol.get('protocolId').trim();
    if (formId)
        form.ids = [{
            source: 'PhenX',
            id: formId,
            version: "21.0"
        }];
}

function createReferenceDocuments(form, protocol) {
    form.referenceDocuments = [];
    let generalReferences = protocol.get('General References');
    if (!_.isEmpty(generalReferences)) {
        _.forEach(generalReferences, generalReference => {
            let gr = generalReference.trim();
            if (!_.isEmpty(gr))
                form.referenceDocuments.push({
                    document: generalReference.trim(),
                    source: 'PhenX'
                });
        });
    }
}

function createProperties(form, protocol) {
    let properties = [];
    let prop1 = ['Specific Instructions', 'Protocol', 'Protocol Name From Source', 'Selection Rationale', 'Life Stage', 'Language', 'Participant', 'Personnel and Training Required', 'Equipment Needs', 'Mode of Administration', 'Derived Variables', 'Process and Review'];
    _.forEach(prop1, p => {
        let value = protocol.get(p);
        if (value) {
            properties.push({key: p, value: value.trim(), source: 'PhenX'});
        }
    });

    let prop3 = ["Keywords"];
    _.forEach(prop3, p => {
        let valueArray = protocol.get(p);
        if (!_.isEmpty(valueArray)) {
            valueArray = valueArray.map(v => {
                return v.trim();
            });
            let value = valueArray.join(",");
            properties.push({key: p.trim(), value: value, source: "PhenX"});
        }
    });

    let prop2 = ['Variables', 'Standards', 'Requirements'];
    _.forEach(prop2, p => {
        let valueArray = protocol.get(p);
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
    form.properties = properties;
}


function createClassification(form, protocol, phenxOrg) {
    protocol.get('classification').pop();
    let classificationArray = protocol.get('classification');
    let uniqueClassifications = _.uniq(classificationArray);
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let elements = classification[0].elements;
    _.forEach(uniqueClassifications, c => {
        elements.push({
            name: c,
            elements: []
        });
        elements = elements[0].elements;
    });
    classificationShare.addCategory({elements: phenxOrg.classifications}, uniqueClassifications);
    form.classification = classification;
}

exports.createForm = function (protocol, phenxOrg) {
    let form = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: updateShare.loaderUsername},
        created: importDate,
        imported: importDate,
        stewardOrg: {name: 'PhenX'},
        changeNote: "Load from version 21.0",
        registrationState: {registrationStatus: "Candidate"}
    };
    createNaming(form, protocol);
    createSources(form, protocol);
    createIds(form, protocol);
    createReferenceDocuments(form, protocol);
    createProperties(form, protocol);
    createClassification(form, protocol, phenxOrg);
    return form;
};