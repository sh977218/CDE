exports.parseDataElementConcept = nciCde => {
    let dataElementConcept = {concepts: []};
    let concept = {
        name: nciCde.DATAELEMENTCONCEPT[0].LongName[0],
        origin: "NCI caDSR",
        originId: nciCde.DATAELEMENTCONCEPT[0].PublicId[0] + "v" + nciCde.DATAELEMENTCONCEPT[0].Version[0]
    };
    dataElementConcept.concepts.push(concept);
    return dataElementConcept;
};
