const _ = require('lodash');

exports.parseIds = nindsForms => {
    let formIdArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formId)
            formIdArray.push(nindsForm.formId.replace('form', '').trim());
    });
    let formId = _.uniq(formIdArray);
    if (formId.length !== 1) {
        console.log(nindsForms[0].formId + ' formId not good');
        process.exit(1);
    }
    let ids = [];

    formId.forEach(i => {
        ids.push({
            source: 'NINDS',
            id: i
        })
    });
    return ids;
};