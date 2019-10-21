import { isEmpty, isEqual, trim, uniqWith } from 'lodash';
import { get } from 'request';
import * as cheerio from 'cheerio';
import { sortReferenceDocuments } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';

const PUBMED_REF_DOC_CACHE: any = {};

function fetchPubmedRef(pmId: string) {
    return new Promise(resolve => {
        const refDocCached = PUBMED_REF_DOC_CACHE[pmId];
        if (refDocCached) {
            resolve(refDocCached);
        } else {
            const pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
            const uri = pubmedUrl + pmId.trim();
            const refDoc: any = {};
            get(uri, (err, response, body) => {
                if (err) {
                    console.log('fetchPubmedRef Error: ' + err);
                    process.exit(1);
                } else if (response.statusCode === 200) {
                    const $ = cheerio.load(body);
                    const title = $('.rprt_all h1').text();
                    const trimTitle = trim(title);
                    if (!isEmpty(trimTitle)) {
                        refDoc.title = trimTitle;
                    }
                    const abstracttext = $('.abstr div').contents().text();
                    const trimAbstracttext = trim(abstracttext);
                    if (!isEmpty(trimAbstracttext)) {
                        refDoc.text = trimAbstracttext;
                    }
                    if (!isEmpty(refDoc)) {
                        refDoc.docType = 'text';
                        refDoc.source = 'PubMed';
                        refDoc.languageCode = 'en-us';
                        refDoc.uri = uri;
                    }
                    PUBMED_REF_DOC_CACHE[pmId] = refDoc;
                    resolve(refDoc);
                } else {
                    console.log(`http.get.status error: uri: ${uri}  statusCode:${response.statusCode}`);
                    process.exit(1);
                }
            });
        }
    });
}

function getReferenceDocuments(referencesString: string = ''): Promise<any[]> {
    return new Promise(async resolve => {
        const duplicatedRefDocs: any = [];
        const regex = /\s*(PMID|PUBMED|pubmed\/)(:|,|\s)*(\s*\d*[.,\s]*)*/ig;
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
                    const refDoc: any = await fetchPubmedRef(pmId).catch(err => {
                        console.log(`fetchPubmedRef Error: + ${err}`);
                        process.exit(1);
                    });
                    if (!isEmpty(refDoc)) {
                        duplicatedRefDocs.push(refDoc);
                    } else {
                        duplicatedRefDocs.push({
                            docType: 'text',
                            languageCode: 'en-us',
                            document: trim(referencesString)
                        });
                    }
                }
            }
        } else {
            duplicatedRefDocs.push({
                docType: 'text',
                languageCode: 'en-us',
                document: trim(referencesString)
            });
        }
        resolve(sortReferenceDocuments(duplicatedRefDocs));
    });
}

export async function parseReferenceDocuments(row: any) {
    const EXCLUDE_REF_DOC = [
        'No references available',
        'Please fill out'
    ];
    let referencesString = getCell(row, 'References');
    EXCLUDE_REF_DOC.forEach(excludeRefDoc => referencesString = referencesString.replace(excludeRefDoc, '').trim());
    const duplicatedRefDocs = await getReferenceDocuments(referencesString);
    return uniqWith(duplicatedRefDocs, isEqual);
}
