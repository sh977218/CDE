import { isEmpty } from 'lodash';
import { get } from 'request';
import * as cheerio from 'cheerio';
import { sortReferenceDocuments } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';

function fetchPubmedRef(pmId: string) {
    return new Promise(resolve => {
        const pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
        const uri = pubmedUrl + pmId.trim();
        const refDoc = {title: '', uri, text: ''};
        get(uri, (err, response, body) => {
            if (err) {
                console.log('fetchPubmedRef Error: ' + err);
                resolve(refDoc);
            } else if (response.statusCode === 200) {
                const $ = cheerio.load(body);
                const title = $('.rprt_all h1').text();
                if (isEmpty(title)) {
                    console.log(`${uri} has empty title`);
                }
                const abstracttext = $('.abstr div').contents().text();
                if (isEmpty(abstracttext)) {
                    console.log(`${uri} has empty Abstract`);
                }
                refDoc.title = title;
                refDoc.text = abstracttext;
                resolve(refDoc);
            } else {
                console.log(`http.get.status error: uri: ${uri}  statusCode:${response.statusCode}`);
                resolve(refDoc);
            }
        });
    });
}

export function parseReferenceDocuments(row: any): Promise<any[]> {
    const EXCLUDE_REF_DOC = [
        'No references available',
        'Please fill out'
    ];
    const referenceDocuments: any[] = [];
    return new Promise(async resolve => {
        let referencesString = getCell(row, 'References');
        EXCLUDE_REF_DOC.forEach(excludeRefDoc => referencesString = referencesString.replace(excludeRefDoc, '').trim());
        if (referencesString) {
            const regex = /\s*(PMID|PUBMED|pubmed\/)(:|,|\s)*(\s*\d*[.|,|\s]*)*/ig;
            const pmIdArray = referencesString.match(regex);
            if (pmIdArray) {
                for (const pmIdString of pmIdArray) {
                    const pmIds = pmIdString
                        .replace(/PMID:/ig, '')
                        .replace(/\./ig, '')
                        .replace(/pubmed\//ig, '')
                        .replace(/PMID/ig, '')
                        .replace(/PUBMED:/ig, '')
                        .trim().split(',').filter(p => !isEmpty(p));
                    for (const pmId of pmIds) {
                        const pubmedRef: any = await fetchPubmedRef(pmId).catch(err => {
                            console.log(`fetchPubmedRef Error: + ${err}`);
                            process.exit(1);
                        });
                        const refDoc: any = {};
                        if (!isEmpty(pubmedRef.title)) {
                            refDoc.title = pubmedRef.title;
                        }
                        if (!isEmpty(pubmedRef.uri)) {
                            refDoc.uri = pubmedRef.uri;
                        }
                        if (!isEmpty(pubmedRef.abstracttext)) {
                            refDoc.document = pubmedRef.abstracttext;
                        }
                        if (!isEmpty(refDoc)) {
                            refDoc.docType = 'text';
                            refDoc.source = 'PubMed';
                            refDoc.languageCode = 'en-us';
                            referenceDocuments.push(refDoc);
                        }
                    }
                }
            } else {
                referenceDocuments.push({
                    docType: 'text',
                    document: referencesString
                });
            }
        }
        resolve(sortReferenceDocuments(referenceDocuments));
    });
}
