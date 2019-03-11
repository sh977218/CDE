const _ = require('lodash');

const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');

exports.parseClassification = (nindsForms, item) => {
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
        if (nindsForm.cdes.length)
            temp.population = nindsForm.cdes[0]['Population'];
        classificationArray.push(temp);
    });

    let uniqClassificationArray = _.uniq(classificationArray, _.isEqual);

    uniqClassificationArray.forEach(c => {
        let diseaseToAdd = ['Disease', c.disease];
        let domainToAdd = ['Domain', c.domain];
        let subDomainToAdd = ['Disease', c.disease];
        let classificationToAdd = ['Disease', c.disease];

        if (c.subDisease) {
            diseaseToAdd.push(c.subDisease);
            classificationToAdd.push(c.subDisease);
            subDomainToAdd.push(c.subDisease);
        }

        if (c.classification) {
            classificationToAdd.push('Classification');
            classificationToAdd.push(c.classification);
        }

        if (c.domain) {
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

        classificationShared.classifyItem(item, "NINDS", diseaseToAdd);
        classificationShared.classifyItem(item, "NINDS", domainToAdd);
        classificationShared.classifyItem(item, "NINDS", subDomainToAdd);
        classificationShared.classifyItem(item, "NINDS", classificationToAdd);

        if (c.population) {
            let populationArray = c.population.split(';');
            populationArray.forEach(p => {
                if (p && p.trim()) {
                    let populationToAdd = [];
                    populationToAdd.push('Population');
                    populationToAdd.push(p);
                    classificationShared.classifyItem(item, "NINDS", populationToAdd);
                }
            })
        }

        classificationShared.sortClassification(item);

    });

};