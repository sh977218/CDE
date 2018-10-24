const _ = require('lodash');

exports.parseReferenceDocuments = nindsForms => {
    let downloadLinkArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.downloadLink)
            downloadLinkArray.push(nindsForm.downloadLink);
    });
    let downloadLink = _.uniq(downloadLinkArray);
    if (downloadLink.length !== 1) {
        console.log(nindsForms[0].formId + ' downloadLink not good');
        process.exit(1);
    }
    let referenceDocuments = [];

    downloadLink.forEach(d => {
        if (d) d = d.trim();
        if (d !== 'No references available') {
            let refWords = _.words(d, /[^\s]+/g);
            let reference = refWords.join(" ");
            let uriIndex = refWords.indexOf('http://www.');
            if (!uriIndex) uriIndex = refWords.indexOf('https://www.');
            referenceDocuments.push({
                title: reference,
                uri: uriIndex === -1 ? '' : refWords[uriIndex],
                source: 'NINDS'
            });
        }
    });
    return referenceDocuments;
};