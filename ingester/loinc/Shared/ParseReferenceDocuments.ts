export function parseReferenceDocuments(loinc) {
    let referenceDocuments = [];
    if (loinc['ARTICLE']) {
        loinc['ARTICLE'].forEach(article => {
            referenceDocuments.push({
                uri: article.SourceLink,
                providerOrg: article.Source,
                title: article.Description,
                document: article.DescriptionLink
            });
        })
    }
    if (loinc['WEB CONTENT']) {
        loinc['WEB CONTENT'].forEach(webContent => {
            referenceDocuments.push({
                uri: webContent.SourceLink,
                providerOrg: webContent.Source,
                title: webContent.Copyright
            });
        })
    }
    return referenceDocuments;
}