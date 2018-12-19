const _ = require('lodash');

const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');

exports.parseClassification = (nindsForms, newForm) => {
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
        classificationArray.push(temp);
    });

    let uniqClassificationArray = _.uniq(classificationArray, _.isEqual);

    uniqClassificationArray.forEach(c => {
        let diseaseToAdd = ['Disease', c.disease];
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
            if (c.subDomain) {
                diseaseToAdd.push(c.subDomain);
                subDomainToAdd.push(c.subDomain);
            }
        }

        classificationShared.classifyItem(newForm, "NINDS", diseaseToAdd);
        classificationShared.classifyItem(newForm, "NINDS", subDomainToAdd);
        classificationShared.classifyItem(newForm, "NINDS", classificationToAdd);
        let domainToAdd = ['Domain', c.domain, c.subDomain];
        classificationShared.classifyItem(newForm, "NINDS", domainToAdd);
    });

};