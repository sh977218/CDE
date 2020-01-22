import { classifyItem } from 'server/classification/orgClassificationSvc';

import { uniq, isEmpty } from 'lodash';
import { sortClassification } from 'shared/system/classificationShared';

export function parseClassification(nindsForms: any[], item: any) {
    const type = item.elementType;
    const classificationArray: string[] = [];
    nindsForms.forEach((nindsForm: any) => {
        const temp: any = {};
        if (!isEmpty(nindsForm.diseaseName)) {
            temp.diseaseName = nindsForm.diseaseName;
        }
        if (!isEmpty(nindsForm.subDiseaseName)) {
            temp.subDiseaseName = nindsForm.subDiseaseName;
        }
        if (!isEmpty(nindsForm.domainName)) {
            temp.domainName = nindsForm.domainName;
        }
        if (!isEmpty(nindsForm.subDomainName)) {
            temp.subDomainName = nindsForm.subDomainName;
        }
        if (!isEmpty(nindsForm.cdes)) {
            const population = [];
            const classification = [];
            nindsForm.cdes.forEach(c => {
                population.push(c.Population);
                classification.push(c.Classification);
            });
            temp.population = uniq(population);
            temp.classification = uniq(classification);
        } else {
            temp.population = [];
            temp.classification = [];
        }
        classificationArray.push(temp);
    });

    const uniqClassificationArray = uniq(classificationArray);

    uniqClassificationArray.forEach((c: any) => {
        const diseaseToAdd = ['Disease', c.diseaseName];
        const domainToAdd = ['Domain', c.domainName];
        const subDomainToAdd = ['Disease', c.diseaseName];
        // CDE only
        const classificationToAdd = ['Disease', c.diseaseName];

        if (!isEmpty(c.subDiseaseName)) {
            diseaseToAdd.push(c.subDiseaseName);
            classificationToAdd.push(c.subDiseaseName);
            subDomainToAdd.push(c.subDiseaseName);
        }

        if (!isEmpty(c.classification)) {
            c.classification.forEach(classification => {
                classificationToAdd.push('Classification');
                classificationToAdd.push(classification);
                classifyItem(item, 'NINDS', classificationToAdd);
            });
        }

        if (!isEmpty(c.domainName)) {
            diseaseToAdd.push('Domain');
            subDomainToAdd.push('Domain');
            diseaseToAdd.push(c.domainName);
            subDomainToAdd.push(c.domainName);
            if (!isEmpty(c.subDomainName)) {
                diseaseToAdd.push(c.subDomainName);
                domainToAdd.push(c.subDomainName);
                subDomainToAdd.push(c.subDomainName);
            }
        }

        classifyItem(item, 'NINDS', diseaseToAdd);
        classifyItem(item, 'NINDS', domainToAdd);
        classifyItem(item, 'NINDS', subDomainToAdd);


        if (!isEmpty(c.population)) {
            c.population.forEach(population => {
                const populationArray = population.split(';');
                populationArray.forEach((p: any) => {
                    if (p && p.trim()) {
                        const populationToAdd = [];
                        populationToAdd.push('Population');
                        populationToAdd.push(p);
                        classifyItem(item, 'NINDS', populationToAdd);
                    }
                });
            })

        }

        sortClassification(item);
    });
}
