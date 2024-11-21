import {capitalize, filter, forEach, isEmpty, replace} from 'lodash';
import {classifyItem} from 'server/classification/orgClassificationSvc';
import {getCell} from '../shared/utility';

function classifyPopulation(cde: any, row: any, defaultClassification) {
    const allKeys: string[] = Object.keys(row);
    const populationKeys = filter(allKeys, k => k.indexOf('population.') !== -1);
    forEach(populationKeys, k => {
        const population = row[k];
        if (!isEmpty(population)) {
            const classificationArray = defaultClassification.concat(['Population', population]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyDomain(cde: any, row: any, defaultClassification) {
    const allKeys: string[] = Object.keys(row);
    const domainKeys = filter(allKeys, k => k.indexOf('domain.') !== -1);
    forEach(domainKeys, k => {
        const domainSubDomainString = row[k];
        const disease = replace(k, 'domain.', '');
        if (!isEmpty(domainSubDomainString) && !isEmpty(disease)) {
            const domainSubDomainArray = domainSubDomainString.split('.');
            const domain = domainSubDomainArray[0];
            const subDomain = domainSubDomainArray[1];

            const isTbiSubDisease = TBI_SUB_DISEASES.indexOf(disease) !== -1;
            let classificationDiseaseArray = defaultClassification.concat(['Disease', capitalize(disease)]);
            if (isTbiSubDisease) {
                // tslint:disable-next-line:max-line-length
                classificationDiseaseArray = defaultClassification.concat(['Disease', 'Traumatic brain injury', capitalize(disease)]);
            }

            // ['Disease','TBI','Domain','Assessments and Examinations','Autonomic']
            // ['Domain','Assessments and Examinations','Autonomic']
            const classificationDomainArray = defaultClassification.concat([]);
            if (!isEmpty(domain)) {
                classificationDiseaseArray.push('Domain');
                classificationDiseaseArray.push(domain);
                classificationDomainArray.push('Domain');
                classificationDomainArray.push(domain);
            }
            if (!isEmpty(subDomain[1])) {
                classificationDiseaseArray.push(subDomain);
                classificationDomainArray.push(subDomain);
            }
            classifyItem(cde, 'NINDS', classificationDiseaseArray);
            classifyItem(cde, 'NINDS', classificationDomainArray);
        }
    });
}

const TBI_SUB_DISEASES = [
    'acute hospitalized',
    'concussion/mild tbi',
    'epidemiology',
    'moderate/severe tbi: rehabilitation',
];

function classifyClassification(cde: any, row: any, defaultClassification) {
    const allKeys: string[] = Object.keys(row);
    const diseaseKeys = filter(allKeys, k => k.indexOf('classification.') !== -1);
    forEach(diseaseKeys, k => {
        const classification = row[k];
        const disease = replace(k, 'classification.', '');
        if (!isEmpty(classification) && !isEmpty(disease)) {
            const isTbiSubDisease = TBI_SUB_DISEASES.indexOf(disease) !== -1;
            let classificationArray = defaultClassification.concat(['Disease', capitalize(disease), 'Classification', classification]);
            if (isTbiSubDisease) {
                // tslint:disable-next-line:max-line-length
                classificationArray = defaultClassification.concat(['Disease', 'Traumatic brain injury', capitalize(disease), 'Classification', classification]);
            }
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

function classifyTaxonomy(cde: any, row: any, defaultClassification) {
    const allKeys: string[] = Object.keys(row);
    const taxonomyKeys = filter(allKeys, k => k.indexOf('taxonomy') !== -1);
    forEach(taxonomyKeys, k => {
        const taxonomy = row[k];
        const taxonomyReplace = taxonomy.replace(';', ',').trim();
        if (!isEmpty(taxonomyReplace)) {
            const classificationArray = defaultClassification.concat(['Taxonomy', taxonomyReplace]);
            classifyItem(cde, 'NINDS', classificationArray);
        }
    });
}

export function parseClassification(cde: any, row: any, defaultClassification = []) {
    classifyPopulation(cde, row, defaultClassification);
    classifyDomain(cde, row, defaultClassification);
    classifyClassification(cde, row, defaultClassification);
    classifyTaxonomy(cde, row, defaultClassification);
}

export function parseNhlbiClassification(eltObj: any, row: any) {
    const populations = getCell(row, 'Population');
    populations.split(';').forEach(population => {
        if (!isEmpty(population)) {
            classifyItem(eltObj, 'NHLBI', ['Sickle Cell', 'Population', population]);
        }
    });
    const domains = getCell(row, 'Domain.Sickle Cell');
    domains.split(';').forEach(domain => {
        if (!isEmpty(domain)) {
            const domainSubDomain = domain.split('.').filter(d => !isEmpty(d));
            classifyItem(eltObj, 'NHLBI', ['Sickle Cell', 'Domain'].concat(domainSubDomain));
        }
    });
    const classifications = getCell(row, 'Classification.Sickle Cell');
    classifications.split(';').forEach(classification => {
        if (!isEmpty(classification)) {
            classifyItem(eltObj, 'NHLBI', ['Sickle Cell', 'Classification', classification]);
        }
    });
}
