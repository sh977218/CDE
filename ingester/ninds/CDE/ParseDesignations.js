const _ = require('lodash');

exports.parseDesignations = nindsForms => {
    let cdeNameArray = [];
    let questionTextArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.cdeName)
                cdeNameArray.push(nindsCde.cdeName);
            if (nindsCde.questionText)
                questionTextArray.push(nindsCde.questionText);
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
                designation: n,
                tags: ['Question Text']
            });
    });
    return designations;
};