exports.parseDesignations = nciCde => {
    let designations = [{
        designation: nciCde.LONGNAME[0],
        tags: []
    }];

    if (nciCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        let designationTags = ["Application Standard Question Text", "Preferred Question Text", "Alternate Question Text"];
        nciCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(refDoc => {
            let tagIndex = designationTags.indexOf(refDoc.DocumentType[0]);
            if (tagIndex > -1) {
                designations.push({
                    designation: refDoc.DocumentText[0],
                    tags: [refDoc.DocumentType[0]]
                });
            }
        });
    }
    return designations;
};