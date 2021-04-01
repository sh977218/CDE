import { isEmpty, isEqual, trim, uniqWith } from 'lodash';
import * as cheerio from 'cheerio';
import { EXCLUDE_REF_DOC, sortReferenceDocuments } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';
import fetch from 'node-fetch';
import { handle200, text } from 'shared/fetch';

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
            fetch(uri)
                .catch(err => {
                    console.log('fetchPubmedRef Error: ' + err);
                    process.exit(1);
                })
                .then(handle200)
                .then(text)
                .then(body => {
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
                }, err => {
                    console.log(`http.get.status error: uri: ${uri}  statusCode: ${err}`);
                    resolve({});
                });
        }
    });
}

function getReferenceDocuments(referencesString: string = ''): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
        const duplicatedRefDocs: any = [];
        /*
        ]        const regex = /\s*(PMID|PUBMED|GENERAL|HEADACHE|NMD|SMA|TBI\/)(:|,|\s)*(\s*\d*[.,\s]*)*!/ig;
                const pmIdArray = referencesString.match(regex);
                if (pmIdArray) {
                    for (const pmIdString of pmIdArray) {
                        const pmIds = pmIdString
                            .replace(/PMID:/ig, '')
                            .replace(/\./ig, '')
                            .replace(/pubmed\//ig, '')
                            .replace(/PMID/ig, '')
                            .replace(/PUBMED:/ig, '')
                            .trim()
                            .split(',').filter(p => !isEmpty(p));
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
        */
        referencesString.split(/-{3,}/ig).forEach(r => {
            duplicatedRefDocs.push({
                docType: 'text',
                languageCode: 'en-us',
                document: trim(r)
            });
        })
        resolve(sortReferenceDocuments(duplicatedRefDocs));
    });
}

export async function parseReferenceDocuments(row: any) {
    const referencesString = getCell(row, 'References');
    const duplicatedRefDocs = await getReferenceDocuments(referencesString);
    return uniqWith(duplicatedRefDocs, isEqual)
        .filter(rd => isEmpty(rd.document) || !EXCLUDE_REF_DOC.includes(rd.document));
}
