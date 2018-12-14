const _ = require('lodash');
const trimWhite = require('../../shared/utility').trimWhite;

exports.parseDesignations = nindsForms => {
    let cdeNameArray = [];
    let questionTextArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE Name'])
                cdeNameArray.push(nindsCde['CDE Name']);
            if (nindsCde['Question Text'])
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
    _questionTextArray.forEach(n => {
        if (n !== 'N/A')
            designations.push({
                designation: n.trimWhite(),
                tags: ['Question Text']
            });
    });
    return designations;
};