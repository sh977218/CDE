export function parseReferenceDocuments(nciXmlCde) {
    const referenceDocuments = [];
    if (nciXmlCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        const tag = ['Application Standard Question Text', 'Preferred Question Text', 'Alternate Question Text'];
        nciXmlCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(refDoc => {
            const tagIndex = tag.indexOf(refDoc.DocumentType[0]);
            if (tagIndex === -1) {
                const newRefDoc: any = {
                    title: refDoc.Name[0],
                    docType: refDoc.DocumentType[0],
                    languageCode: refDoc.Language[0]
                };
                if (refDoc.DocumentText[0].length > 0) {
                    newRefDoc.text = refDoc.DocumentText[0];
                }
                if (newRefDoc.languageCode === 'ENGLISH') {
                    newRefDoc.languageCode = 'EN-US';
                }
                if (refDoc.OrganizationName[0].length > 0) {
                    newRefDoc.providerOrg = refDoc.OrganizationName[0];
                }
                if (refDoc.URL[0].length > 0) {
                    newRefDoc.url = refDoc.URL[0];
                }
                referenceDocuments.push(newRefDoc);
            }
        });
    }
    return referenceDocuments;

}

export function parseReferenceDocuments2(xml) {
    const referenceDocuments = [];
    xml.referenceDocument?.forEach(refDoc => {
        const newRefDoc: any = {
            title: refDoc.name,
            docType: refDoc.type,
            languageCode: refDoc.languageName,
            text: refDoc.doctext,
            url: refDoc.URL
        };
        referenceDocuments.push(newRefDoc);
    })
    return referenceDocuments;

}
