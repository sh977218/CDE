const _ = require('lodash');

exports.parseSources = nindsForms => {
    let versionDateArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.versionDate)
            versionDateArray.push(nindsForm.versionDate);
    });
    let versionDate = _.uniq(versionDateArray);
    if (versionDate.length !== 1) {
        console.log(nindsForms[0].formId + ' versionDate not good');
        process.exit(1);
    }
    let sources = [];
    versionDate.forEach(v => {
        sources.push({
            sourceName: 'NINDS',
            updated: v
        })
    });
    return sources;
};