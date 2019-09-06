import { isEmpty } from 'lodash';
import { get } from 'request';
import * as cheerio from 'cheerio';
import { sortReferenceDocuments } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/cde/cde';

const UNPARSED_REF_DOC = new Set();

function fetchPubmedRef(pmId) {
    return new Promise(resolve => {
        const pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
        const uri = pubmedUrl + pmId.trim();
        get(uri, (err, response, body) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else if (response.statusCode === 200) {
                const $ = cheerio.load(body);
                const title = $('.rprt_all h1').text();
                const abstracttext = $('.abstr div').contents().text();
                if (isEmpty(abstracttext)) {
                    console.log(`${uri} has empty Abstract`);
                }
                resolve({title, uri, text: abstracttext});
            } else {
                console.log('status: ' + response.statusCode);
                process.exit(1);
            }
        });
    });
}
export function parseReferenceDocuments(row) {
    const EXCLUDE_REF_DOC = [
        'No references available',
        'Please fill out'
    ];
    const referenceDocuments = [];
    return new Promise(async (resolve, reject) => {
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
                        const pubmedRef = await fetchPubmedRef(pmId);
                        referenceDocuments.push({
                            docType: 'text',
                            title: pubmedRef.title
                            uri: pubmedRef.uri,
                            source: 'PubMed',
                            languageCode: 'en-us',
                            document: pubmedRef.abstracttext
                        });
                    }
                }
            } else {
                UNPARSED_REF_DOC.add(referencesString);
                referenceDocuments.push({
                    document: referencesString
                });
            }
        }
        resolve(sortReferenceDocuments(referenceDocuments));
    });
}
