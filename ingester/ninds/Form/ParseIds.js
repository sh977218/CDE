const _ = require('lodash');

exports.parseIds = nindsForms => {
    let formIdArray = [];
    let versionNumArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.formId)
            formIdArray.push(nindsForm.formId);
        if (nindsForm.versionNum)
            versionNumArray.push(nindsForm.versionNum);
    });
    let formId = _.uniq(formIdArray);
    let versionNum = _.uniq(versionNumArray);
    if (formId.length !== 1) {
        console.log(nindsForms[0].formId + ' formId not good');
        process.exit(1);
    }
    if (versionNum.length !== 1) {
        console.log(nindsForms[0].formId + ' versionNum not good');
        process.exit(1);
    }
    let ids = [];

    formId.forEach(i => {
        ids.push({
            source: 'NINDS',
            id: i,
            version: versionNum[0]
        })
    });
    return ids;
};