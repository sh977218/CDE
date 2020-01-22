export function parseObjectClass(nciXmlCde) {
    const objectClass = {concepts: []};
    if (nciXmlCde.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
        nciXmlCde.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(con => {
            con.ORIGIN[0].split(':').forEach(c => {
                const concept = {
                    name: con.LONG_NAME[0],
                    origin: c,
                    originId: con.PREFERRED_NAME[0]
                };
                objectClass.concepts.push(concept);
            });
        });
    }
    return objectClass;
}
