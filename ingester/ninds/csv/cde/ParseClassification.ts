import { filter, replace, isEmpty, capitalize } from 'lodash';
import { classifyItem } from 'server/classification/orgClassificationSvc';

const DEFAULT_CLASSIFICATION = ['Preclinical + NEI'];

function classifyPopulation(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const populationKeys = filter(allKeys, k => k.indexOf('population.') !== -1);
    populationKeys.forEach(k => {
        const population = row[k];
        if (!isEmpty(population)) {
            const classificationArray = DEFAULT_CLASSIFICATION.concat(['Population', capitalize(population)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyDomain(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const domainKeys = filter(allKeys, k => k.indexOf('domain.') !== -1);
    domainKeys.forEach(k => {
        const domain = row[k];
        const disease = replace(k, 'domain.', '');
        if (!isEmpty(domain) && !isEmpty(disease)) {
            const classificationArray = DEFAULT_CLASSIFICATION.concat(['Domain', capitalize(domain), capitalize(disease)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyDisease(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const diseaseKeys = filter(allKeys, k => k.indexOf('classification.') !== -1);
    diseaseKeys.forEach(k => {
        const classification = row[k];
        const disease = replace(k, 'classification.', '');
        if (!isEmpty(classification) && !isEmpty(disease)) {
            const classificationArray =
                DEFAULT_CLASSIFICATION.concat(['Classification', capitalize(classification), capitalize(disease)]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
//        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Disease', disease, 'Domain', domain]);
    });
}

function classifyTaxonomy(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const taxonomyKeys = filter(allKeys, k => k.indexOf('Taxonomy') !== -1);
    taxonomyKeys.forEach(k => {
        const taxonomy = row[k];
        const classificationArray = DEFAULT_CLASSIFICATION.concat(['Taxonomy', capitalize(taxonomy)]);
        classifyItem(cde, 'NINDS', classificationArray);
    });
}

export function parseClassification(cde: any, row: any) {
    classifyPopulation(cde, row);
    classifyDomain(cde, row);
    classifyDisease(cde, row);
    classifyTaxonomy(cde, row);
}
