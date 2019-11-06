import { classifyItem } from 'server/classification/orgClassificationSvc';

import { uniq, isEmpty } from 'lodash';
import { sortClassification } from 'shared/system/classificationShared';

export function parseClassification(nindsForms: any[], item: any) {
    const type = item.elementType;
    const classificationArray: string[] = [];
    nindsForms.forEach((nindsForm: any) => {
        const temp: any = {};
        if (nindsForm.disease) {
            temp.disease = nindsForm.disease;
        }
        if (nindsForm.subDisease) {
            temp.subDisease = nindsForm.subDisease;
        }
        if (nindsForm.domain) {
            temp.domain = nindsForm.domain;
        }
        if (nindsForm.subDomain) {
            temp.subDomain = nindsForm.subDomain;
        }
        if (nindsForm.cdes.length && type === 'cde') {
            temp.population = nindsForm.cdes[0].Population;
            temp.classification = nindsForm.cdes[0].Classification;
        }
        classificationArray.push(temp);
    });

    const uniqClassificationArray = uniq(classificationArray);

    uniqClassificationArray.forEach((c: any) => {
        const diseaseToAdd = ['Disease', c.disease];
        const domainToAdd = ['Domain', c.domain];
        const subDomainToAdd = ['Disease', c.disease];
        // CDE only
        const classificationToAdd = ['Disease', c.disease];

        if (!isEmpty(c.subDisease)) {
            diseaseToAdd.push(c.subDisease);
            classificationToAdd.push(c.subDisease);
            subDomainToAdd.push(c.subDisease);
        }

        if (!isEmpty(c.classification) && type === 'cde') {
            classificationToAdd.push('Classification');
            classificationToAdd.push(c.classification);
            classifyItem(item, 'NINDS', classificationToAdd);
        }

        if (!isEmpty(c.domain)) {
            diseaseToAdd.push('Domain');
            subDomainToAdd.push('Domain');
            diseaseToAdd.push(c.domain);
            subDomainToAdd.push(c.domain);
            if (!isEmpty(c.subDomain)) {
                diseaseToAdd.push(c.subDomain);
                domainToAdd.push(c.subDomain);
                subDomainToAdd.push(c.subDomain);
            }
        }

        classifyItem(item, 'NINDS', diseaseToAdd);
        classifyItem(item, 'NINDS', domainToAdd);
        classifyItem(item, 'NINDS', subDomainToAdd);


        if (!isEmpty(c.population) && type === 'cde') {
            const populationArray = c.population.split(';');
            populationArray.forEach((p: any) => {
                if (p && p.trim()) {
                    const populationToAdd = [];
                    populationToAdd.push('Population');
                    populationToAdd.push(p);
                    classifyItem(item, 'NINDS', populationToAdd);
                }
            });
        }

        sortClassification(item);
    });
}
