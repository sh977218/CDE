const request = require('request');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;

exports.parseSources = nciCde => {
    return new Promise((resolve, reject) => {
        let source = {sourceName: 'caDSR',imported:new Date()};
        if (nciCde.VALUEDOMAIN[0].Datatype[0])
            source['datatype'] = nciCde.VALUEDOMAIN[0].Datatype[0];
        if (nciCde.REGISTRATIONSTATUS[0] && nciCde.REGISTRATIONSTATUS[0].length > 0) {
            source['registrationStatus'] = nciCde.REGISTRATIONSTATUS[0];
        }
        let id = nciCde.PUBLICID[0];
        let version = nciCde.VERSION[0];

        let options = {
            method: 'GET',
            url: 'http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML',
            qs: {query: 'DataElement[@publicId=' + id + '][@version=' + version + ']'}
        };
        request(options, function (error, response, body) {
            if (error) reject(error);
            parseString(body, function (e, json) {
                if (e) reject(e);
                let fields = json['xlink:httpQuery']['queryResponse'][0]['class'][0]['field'];
                fields.forEach(field => {
                    if (field.attribute.name == 'dateCreated') {
                        source['created'] = field._;
                    }
                    if (field.attribute.name == 'dateModified') {
                        source['updated'] = field._;
                    }
                });
                resolve([source]);
            })
        })

    })


};
