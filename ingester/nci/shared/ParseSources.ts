const request = require('request');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;

export function parseSources(nciXmlCde) {
    return new Promise((resolve, reject) => {
        const source: any = {sourceName: 'caDSR', imported: new Date()};
        if (nciXmlCde.VALUEDOMAIN[0].Datatype[0]) {
            source.datatype = nciXmlCde.VALUEDOMAIN[0].Datatype[0];
        }
        if (nciXmlCde.REGISTRATIONSTATUS[0] && nciXmlCde.REGISTRATIONSTATUS[0].length > 0) {
            source.registrationStatus = nciXmlCde.REGISTRATIONSTATUS[0];
        }
        const id = nciXmlCde.PUBLICID[0];
        const version = nciXmlCde.VERSION[0];

        const options = {
            method: 'GET',
            url: 'http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML',
            qs: {query: 'DataElement[@publicId=' + id + '][@version=' + version + ']'}
        };
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            parseString(body, (e, json) => {
                if (e) {
                    reject(e);
                }
                const fields = json['xlink:httpQuery'].queryResponse[0].class[0].field;
                fields.forEach(field => {
                    if (field.attribute.name === 'dateCreated') {
                        source.created = field._;
                    }
                    if (field.attribute.name === 'dateModified') {
                        source.updated = field._;
                    }
                });
                resolve([source]);
            });
        });

    });
}
