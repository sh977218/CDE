const _ = require('lodash');

exports.parseDesignations = nindsForms => {
    let crfModuleGuidelineArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.crfModuleGuideline)
            crfModuleGuidelineArray.push(nindsForm.crfModuleGuideline);
    });

    let crfModuleGuideline = _.uniq(crfModuleGuidelineArray);
    if (crfModuleGuideline.length !== 1) {
        console.log(nindsForms[0].formId + ' crfModuleGuideline not good');
        process.exit(1);
    }
    let designations = [];

    crfModuleGuideline.forEach(c => {
        designations.push({
            designation: c.trim(),
            tags: []
        })
    });
    return designations;
};