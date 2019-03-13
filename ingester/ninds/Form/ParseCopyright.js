const _ = require('lodash');

exports.parseCopyright = nindsForms => {
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
    let copyright = _formNameArray[0].indexOf('©') !== -1;
    return copyright;

};