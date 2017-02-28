var mongo_data = require('../../../modules/system/node-js/mongo-data');
var classificationShare = require('../../../modules/system/shared/classificationShared');

exports.protocolToForm = function (protocol) {
    var classificationLength = protocol['classification'].length;
    var form = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NLM'
        },
        created: new Date(),
        updated: new Date(),
        imported: new Date(),
        origin: protocol['Source'],
        naming: [{designation: protocol['classification'][classificationLength - 1], tags: [{tag: ''}]}, {
            designation: protocol['Protocol Name From Source'],
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
            document: protocol['General References']
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
            value: protocol['Protocol Name From Source']
        });
    }
    if (protocol['Specific Instructions']) {
        form.properties.push({
            key: 'Specific Instructions',
            value: protocol['Specific Instructions']
        });
    }
    if (protocol['Protocol']) {
        form.properties.push({
            key: 'Protocol',
            value: protocol['Protocol']
        });
    }
    if (protocol['Selection Rationale']) {
        form.properties.push({
            key: 'Selection Rationale',
            value: protocol['Selection Rationale']
        });
    }
    if (protocol['Life Stage']) {
        form.properties.push({
            key: 'Life Stage',
            value: protocol['Life Stage']
        });
    }
    if (protocol['Language']) {
        form.properties.push({
            key: 'Language',
            value: protocol['Language']
        });
    }
    if (protocol['Participant']) {
        form.properties.push({
            key: 'Participant',
            value: protocol['Participant']
        });
    }
    if (protocol['Personnel and Training Required']) {
        form.properties.push({
            key: 'Personnel and Training Required',
            value: protocol['Personnel and Training Required']
        });
    }
    if (protocol['Equipment Needs']) {
        form.properties.push({
            key: 'Equipment Needs',
            value: protocol['Equipment Needs']
        });
    }
    if (protocol['Mode of Administration']) {
        form.properties.push({
            key: 'Mode of Administration',
            value: protocol['Mode of Administration']
        });
    }
    if (protocol['Derived Variables']) {
        form.properties.push({
            key: 'Derived Variables',
            value: protocol['Derived Variables']
        });
    }
    if (protocol['Process and Review']) {
        form.properties.push({
            key: 'Process and Review',
            value: protocol['Process and Review']
        });
    }
    if (protocol['Variables'] && protocol['Variables'].length > 0) {
        var ths = '<tr><th>Variable Name</th><th>Variable ID</th><th>Variable Description</th><th>Version</th><th>Mapping</th></tr>';
        var tbody = '';
        protocol['Variables'].forEach((v)=> {
            tbody += '<tr><td>' + v['Variable Name'] + '</td><td>' + v['Variable ID'] + '</td><td>' + v['Variable Description'] + '</td><td>' + v['Version'] + '</td><td>' + v['Mapping'] + '</td></tr>'
        });
        form.properties.push({
            key: 'Variables',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html'
        });
    }
    if (protocol['Standards'] && protocol['Standards'].length > 0) {
        var ths = '<tr><th>Standard</th><th>Name</th><th>ID</th><th>Source</th></tr>';
        var tbody = '';
        protocol['Standards'].forEach((s)=> {
            tbody += '<tr><td>' + s['Standard'] + '</td><td>' + s['Name'] + '</td><td>' + s['ID'] + '</td><td>' + s['Source'] + '</td></tr>'
        });
        form.properties.push({
            key: 'Standards',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html'
        });
    }
    if (protocol['Requirements'] && protocol['Requirements'].length > 0) {
        var ths = '<tr><th>Requirement Category</th><th>Required</th></tr>';
        var tbody = '';
        protocol['Requirements'].forEach((r)=> {
            tbody += '<tr><td>' + r['Requirement Category'] + '</td><td>' + r['Required'] + '</td></tr>'
        });
        form.properties.push({
            key: 'Requirements',
            value: '<table class="table table-striped">' + ths + tbody + '</table>',
            valueFormat: 'html'
        });
    }

    return form;
};