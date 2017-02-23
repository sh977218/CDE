var mongo_data = require('../../../modules/system/node-js/mongo-data');
var classificationShare = require('../../../modules/system/shared/classificationShared');

exports.protocolToForm = function (protocol) {
    var form = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NLM'
        },
        created: new Date(),
        updated: new Date(),
        imported: new Date(),
        origin: protocol['Source'],
        naming: [{
            designation: protocol['Protocol Name From Source'],
            definition: protocol['Description of Protocol'],
            tags: [{tag: ''}]
        }],
        sources: [{
            sourceName: 'PhenX',
            created: protocol['Protocol Release Date']
        }],
        registrationState: {
            registrationStatus: "Qualified",
            effectiveDate: protocol['Protocol Release Date']
        },
        properties: [],
        referenceDocuments: [{
            document: protocol['General References']
        }],
        ids: [{source: 'PhenX', id: 'PX' + protocol['protocolId']}],
        classification: [],
        formElements: []
    };
    if (protocol['classification']) {
        classificationShare.classifyItem(form, 'PhenX', ['REDCap'].concat(protocol['classification']));
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
        var variables = [];
        protocol['Variables'].forEach((v)=> {
            variables.push({
                'Mapping': v['Mapping'],
                'Version': v['Version'],
                'Variable Description': v['Variable Description'],
                'Variable ID': v['Variable ID'],
                'Variable Name': v['Variable Name']
            })
        });
        form.properties.push({
            key: 'Variables',
            value: variables,
            valueFormat: 'html'
        });
    }
    if (protocol['Standards'] && protocol['Standards'].length > 0) {
        var standards = [];
        protocol['Standards'].forEach((s)=> {
            standards.push({
                'Source': s['Source'],
                'ID': s['ID'],
                'Name': s['Name'],
                'Standard': s['Standard']
            })
        });
        form.properties.push({
            key: 'Standards',
            value: standards,
            valueFormat: 'html'
        });
    }
    if (protocol['Requirements'] && protocol['Requirements'].length > 0) {
        var requirements = [];
        protocol['Requirements'].forEach((r)=> {
            requirements.push({
                'Required': r['Required'],
                'Requirement Category': r['Requirement Category']
            })
        });
        form.properties.push({
            key: 'Requirements',
            value: requirements,
            valueFormat: 'html'
        });
    }

    return form;
};