import { filter, replace, trim } from 'lodash';
import { classifyItem } from 'server/classification/orgClassificationSvc';

function classifyPopulation(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const populationKeys = filter(allKeys, k => k.indexOf('population.') !== -1);
    populationKeys.forEach(k => {
        const population = row[k];
        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Population', population]);
    });
}

function classifyDomain(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const domainKeys = filter(allKeys, k => k.indexOf('domain.') !== -1);
    domainKeys.forEach(k => {
        const domain = row[k];
        const disease = replace(k, 'domain.', '');
        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Domain', domain, disease]);
    });
}

function classifyDisease(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const diseaseKeys = filter(allKeys, k => k.indexOf('classification.') !== -1);
    diseaseKeys.forEach(k => {
        const classification = row[k];
        const disease = replace(k, 'classification.', '');
        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Disease', disease, 'Classification', classification]);
//        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Disease', disease, 'Domain', domain]);
    });
}

function classifyTaxonomy(cde: any, row: any) {
    const allKeys: string[] = Object.keys(row);
    const taxonomyKeys = filter(allKeys, k => k.indexOf('Taxonomy') !== -1);
    taxonomyKeys.forEach(k => {
        const taxonomy = row[k];
        classifyItem(cde, 'NINDS', ['Preclinical + NEI', 'Taxonomy', taxonomy]);
    });
}

export function parseClassification(cde, row) {
    classifyPopulation(cde, row);
    classifyDomain(cde, row);
    classifyDisease(cde, row);
    classifyTaxonomy(cde, row);
}
