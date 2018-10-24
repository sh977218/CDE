const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

exports.parseClassification = (nindsForms, newForm) => {
    let classificationArray = [];
    nindsForms.forEach(nindsForm => {
        let temp = {};
        if (nindsForm.diseaseName)
            temp.diseaseName = nindsForm.diseaseName;
        if (nindsForm.subDiseaseName)
            temp.subDiseaseName = nindsForm.subDiseaseName;
        if (nindsForm.domainName)
            temp.domainName = nindsForm.domainName;
        if (nindsForm.subDomainName)
            temp.subDomainName = nindsForm.subDomainName;
        classificationArray.push(temp);
    });

    let uniqClassificationArray = _.uniq(classificationArray, _.isEqual);

    uniqClassificationArray.forEach(c => {
        let diseaseToAdd = ['Disease', c.disease];
        let subDomainToAdd = ['Disease', c.disease];
        let classificationToAdd = ['Disease', c.disease];

        if (c.disease === 'Traumatic Brain Injury') {
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
            diseaseToAdd.push([c.domain, c.subDomain]);
            subDomainToAdd.push([c.domain, c.subDomain]);
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