exports.parseDefinitions = nciCde => {
    let definitions = [{
        definition: nciCde.PREFERREDDEFINITION[0],
        tags: [{tag: "Health"}]
    }];
    if (nciCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        let designationTags = ["Application Standard Question Text", "Preferred Question Text", "Alternate Question Text"];
        nciCde.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(refDoc => {
            let tagIndex = designationTags.indexOf(refDoc.DocumentType[0]);
            if (tagIndex > -1) {
                definitions.push({
                    definition: refDoc.Name[0],
                    tags: [refDoc.DocumentType[0]]
                });
            }
        });
    }

    return definitions;
};