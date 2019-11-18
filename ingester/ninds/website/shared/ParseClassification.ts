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
        if (nindsForm.cdes && nindsForm.cdes.length && type === 'cde') {
            temp.population = nindsForm.cdes[0].Population;
            temp.classification = nindsForm.cdes[0].Classification;
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

        if (!isEmpty(c.classification) && type === 'cde') {
            classificationToAdd.push('Classification');
            classificationToAdd.push(c.classification);
            classifyItem(item, 'NINDS', classificationToAdd);
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
