exports.parseReferenceDocuments = function (loinc) {
    var referenceDocuments = [];
    if (loinc['ARTICLE']) {
        loinc['ARTICLE']['ARTICLE'].forEach(function (article) {
            referenceDocuments.push({
                uri: article.SourceLink,
                providerOrg: article.Source,
                title: article.Description,
                document: article.DescriptionLink
            });
        })
    }
    if (loinc['WEB CONTENT'] && loinc['WEB CONTENT']['WEB CONTENT']) {
        loinc['WEB CONTENT']['WEB CONTENT'].forEach(function (webContent) {
            var referenceDoc = {
                uri: webContent.SourceLink,
                providerOrg: webContent.Source,
                title: webContent.Copyright
            };
            referenceDocuments.push(referenceDoc);
        })
    }
    return referenceDocuments;
};