const _ = require('lodash');
const trimWhite = require('../../shared/utility').trimWhite;

exports.parseDesignations = nindsForms => {
    let formNameArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formName)
            formNameArray.push(nindsForm.formName);
    });

    let _formNameArray = _.uniq(formNameArray);
    if (_formNameArray.length !== 1) {
        console.log(nindsForms[0].formId + ' _formNameArray not good');
        process.exit(1);
    }
    let designations = [];

    _formNameArray.forEach(c => {
        designations.push({
            designation: trimWhite(c),
            tags: []
        })
    });
    return designations;
};