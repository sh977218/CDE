const _ = require('lodash');
const trimWhite = require('../../shared/utility').trimWhite;

exports.parseDesignations = nindsForms => {
    let cdeNameArray = [];
    let questionTextArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE Name'])
                cdeNameArray.push(nindsCde['CDE Name']);
            if (nindsCde['Question Text'] && nindsCde['Question Text'] !== 'N/A')
                questionTextArray.push(nindsCde['Question Text']);
        })
    });

    let _cdeNameArray = _.uniq(cdeNameArray);
    let _questionTextArray = _.uniq(questionTextArray);

    let designations = [];
    _cdeNameArray.forEach(n => {
        designations.push({
            designation: n,
            tags: []
        })
    });

    _questionTextArray.forEach(questionText => {
        let designationIndex = _.indexOf(designations, d => d.designation === questionText);
        if (designationIndex !== -1) {
            designations[designationIndex].tags.push('Question Text');
        } else {
            designations.push({designation: questionText, tags: ['Question Text']});
        }
    });


    designations.forEach(designation => {
    });
    return designations;
};