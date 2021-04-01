import { imported } from 'ingester/shared/utility';
import fetch from 'node-fetch';
import { Parser } from 'xml2js';

const parseString = new Parser({attrkey: 'attribute'}).parseString;

export function parseSources(nciXmlCde: any) {
    return new Promise((resolve, reject) => {
        const source: any = {sourceName: 'caDSR', imported};
        if (nciXmlCde.VALUEDOMAIN[0].Datatype[0]) {
            source.datatype = nciXmlCde.VALUEDOMAIN[0].Datatype[0];
        }
        if (nciXmlCde.REGISTRATIONSTATUS[0] && nciXmlCde.REGISTRATIONSTATUS[0].length > 0) {
            source.registrationStatus = nciXmlCde.REGISTRATIONSTATUS[0];
        }
        const id = nciXmlCde.PUBLICID[0];
        const version = nciXmlCde.VERSION[0];

        fetch(`http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML?query=DataElement[@publicId=${id}][@version=${version}]`)
            .then(res => res.text())
            .then(body => {
                parseString(body, (e: Error | null, xmlObj: any) => {
                    if (e) {
                        reject(e);
                    }
                    const fields = xmlObj['xlink:httpQuery'].queryResponse[0].class[0].field;
                    fields.forEach((field: any) => {
                        if (field.attribute.name === 'dateCreated') {
                            source.created = field._;
                        }
                        if (field.attribute.name === 'dateModified') {
                            source.updated = field._;
                        }
                    });
                    resolve([source]);
                });
            }, reject);
    });
}
