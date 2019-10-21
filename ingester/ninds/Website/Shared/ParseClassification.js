import { classifyItem } from 'server/classification/orgClassificationSvc';

const _ = require('lodash');
import { sortClassification } from 'shared/system/classificationShared';

exports.parseClassification = (nindsForms, item) => {
    let type = item.elementType;
    let classificationArray = [];
    nindsForms.forEach(nindsForm => {
        let temp = {};
        if (nindsForm.disease)
            temp.disease = nindsForm.disease;
        if (nindsForm.subDisease)
            temp.subDisease = nindsForm.subDisease;
        if (nindsForm.domain)
            temp.domain = nindsForm.domain;
        if (nindsForm.subDomain)
            temp.subDomain = nindsForm.subDomain;
        if (nindsForm.cdes.length && type === 'cde') {
            temp.population = nindsForm.cdes[0]['Population'];
            temp.classification = nindsForm.cdes[0]['Classification'];
        }
        classificationArray.push(temp);
    });

    let uniqClassificationArray = _.uniq(classificationArray, _.isEqual);

    uniqClassificationArray.forEach(c => {
        let diseaseToAdd = ['Disease', c.disease];
        let domainToAdd = ['Domain', c.domain];
        let subDomainToAdd = ['Disease', c.disease];
        // CDE only
        let classificationToAdd = ['Disease', c.disease];

        if (!_.isEmpty(c.subDisease)) {
            diseaseToAdd.push(c.subDisease);
            classificationToAdd.push(c.subDisease);
            subDomainToAdd.push(c.subDisease);
        }

        if (!_.isEmpty(c.classification) && type === 'cde') {
            classificationToAdd.push('Classification');
            classificationToAdd.push(c.classification);
            classifyItem(item, "NINDS", classificationToAdd);
        }

        if (!_.isEmpty(c.domain)) {
            diseaseToAdd.push('Domain');
            subDomainToAdd.push('Domain');
            diseaseToAdd.push(c.domain);
            subDomainToAdd.push(c.domain);
            if (!_.isEmpty(c.subDomain)) {
                diseaseToAdd.push(c.subDomain);
                domainToAdd.push(c.subDomain);
                subDomainToAdd.push(c.subDomain);
            }
        }

        classifyItem(item, "NINDS", diseaseToAdd);
        classifyItem(item, "NINDS", domainToAdd);
        classifyItem(item, "NINDS", subDomainToAdd);


        if (!_.isEmpty(c.population) && type === 'cde') {
            let populationArray = c.population.split(';');
            populationArray.forEach(p => {
                if (p && p.trim()) {
                    let populationToAdd = [];
                    populationToAdd.push('Population');
                    populationToAdd.push(p);
                    classifyItem(item, "NINDS", populationToAdd);
                }
            })
        }

        sortClassification(item);

    });

};