const _ = require('lodash');

exports.parseCopyright = nindsForms => {
    let copyrightArray = [];
    nindsForms.forEach(nindsForm => {
        copyrightArray.push(nindsForm.copyright);
    });

    let copyright = _.uniq(copyrightArray);
    if (copyright.length !== 1) {
        console.log(nindsForms[0].formId + ' copyright not good');
        process.exit(1);
    }

    return copyright[0];

};