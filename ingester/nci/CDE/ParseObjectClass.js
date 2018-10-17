exports.parseObjectClass = nciCde => {
    let objectClass = {concepts: []};
    if (nciCde.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
        nciCde.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(con => {
            con.ORIGIN[0].split(":").forEach(c => {
                let concept = {
                    name: con.LONG_NAME[0],
                    origin: c,
                    originId: con.PREFERRED_NAME[0]
                };
                objectClass.concepts.push(concept);
            })
        });
    }
    return objectClass;
};
