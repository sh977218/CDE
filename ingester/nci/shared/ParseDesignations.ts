import {trimWhite} from 'ingester/shared/utility';

export function parseDesignations(nciXmlCde) {
    const designations = [{
        designation: trimWhite(nciXmlCde.LONGNAME[0]),
        tags: []
    }];

    if (nciXmlCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        const designationTags = ['Application Standard Question Text', 'Preferred Question Text', 'Alternate Question Text'];
        nciXmlCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(refDoc => {
            const tagIndex = designationTags.indexOf(refDoc.DocumentType[0]);
            if (tagIndex > -1) {
                designations.push({
                    designation: trimWhite(refDoc.DocumentText[0]),
                    tags: [refDoc.DocumentType[0]]
                });
            }
        });
    }
    return designations;
}
