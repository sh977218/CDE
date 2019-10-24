import { filter, replace, isEmpty, capitalize, words, map, indexOf, forEach } from 'lodash';
import { classifyItem } from 'server/classification/orgClassificationSvc';

const DEFAULT_CLASSIFICATION = ['Preclinical + NEI'];


const CAPITALIZE_BLACK_LIST = ['of', 'the', 'a'];

function formatStringByToken(str: string, token: any) {
    if (token.length !== 1) {
        console.log(token + ' is not validated token.');
        process.exit(1);
    }
    const strArray = words(str, token.regex).filter(s => !isEmpty(s));
    const formatStrArray = map(strArray, str => {
        const i = indexOf(CAPITALIZE_BLACK_LIST, str);
        if (i === -1) {
            return str;
        } else {
            return str;
        }
    });
    return formatStrArray.join(token.char);
}

const tokens = [{char: '/', regex: new RegExp(/[^\/]+/, 'g')},
    {char: ';', regex: new RegExp(/[^:]+/, 'g')}];

function formatString(str: string) {
    const strArray = words(str, /[^\s]+/g).filter(s => !isEmpty(s));
    const formatStrArray = map(strArray, str => {
        const i = indexOf(CAPITALIZE_BLACK_LIST, str);
        if (i === -1) {
            tokens.forEach(token => {
                str = formatStringByToken(str, token);
            });
            return str;
        } else {
            return str;
        }
    });
    return formatStrArray.join(' ');
}

function classifyPopulation(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const populationKeys = filter(allKeys, k => k.indexOf('population.') !== -1);
    forEach(populationKeys, k => {
        const population = row[k];
        if (!isEmpty(population)) {
            const classificationArray = DEFAULT_CLASSIFICATION.concat(['Population', formatString(population)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyDomain(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const domainKeys = filter(allKeys, k => k.indexOf('domain.') !== -1);
    forEach(domainKeys, k => {
        const domain = row[k];
        const disease = replace(k, 'domain.', '');
        if (!isEmpty(domain) && !isEmpty(disease)) {
            const classificationArray = DEFAULT_CLASSIFICATION.concat(['Domain', formatString(domain), formatString(disease)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}


function classifyDisease(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const diseaseKeys = filter(allKeys, k => k.indexOf('classification.') !== -1);
    forEach(diseaseKeys, k => {
        const classification = row[k];
        const disease = replace(k, 'classification.', '');
        if (!isEmpty(classification) && !isEmpty(disease)) {
            const classificationArray =
                DEFAULT_CLASSIFICATION.concat(['Classification', formatString(classification), formatString(disease)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyTaxonomy(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const taxonomyKeys = filter(allKeys, k => k.indexOf('Taxonomy') !== -1);
    forEach(taxonomyKeys, k => {
        const taxonomy = row[k];
        const classificationArray = DEFAULT_CLASSIFICATION.concat(['Taxonomy', formatString(taxonomy)]);
        classifyItem(cde, 'NINDS', classificationArray);
    });
}

export function parseClassification(cde: any, row: any) {
    classifyPopulation(cde, row);
    classifyDomain(cde, row);
    classifyDisease(cde, row);
    classifyTaxonomy(cde, row);
}
