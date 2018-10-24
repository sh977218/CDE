const _ = require('lodash');

exports.parseDefinitions = nindsForms => {
    let crfModuleGuidelineArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.description)
            crfModuleGuidelineArray.push(nindsForm.description);
    });

    let description = _.uniq(crfModuleGuidelineArray);
    if (description.length !== 1) {
        console.log(nindsForms[0].formId + ' description not good');
        process.exit(1);
    }
    let definitions = [];

    description.forEach(c => {
        definitions.push({
            definition: c.trim(),
            tags: []
        })
    });
    return definitions;
};