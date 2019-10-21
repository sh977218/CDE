const _ = require('lodash');

exports.parseReferenceDocuments = nindsForms => {
    let downloadLinkArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.downloadLink)
            downloadLinkArray.push(nindsForm.downloadLink);
    });
    let downloadLink = _.uniq(downloadLinkArray);
    let referenceDocuments = [];

    downloadLink.forEach(d => {
        referenceDocuments.push({
            uri: d.trim(),
            source: 'NINDS'
        });
    });
    return referenceDocuments;
};