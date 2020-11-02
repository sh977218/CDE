export function parseDataElementConcept(nciXmlCde: any) {
    const dataElementConcept: any = {concepts: []};
    const concept = {
        name: nciXmlCde.DATAELEMENTCONCEPT[0].LongName[0],
        origin: 'NCI caDSR',
        originId: nciXmlCde.DATAELEMENTCONCEPT[0].PublicId[0] + 'v' + nciXmlCde.DATAELEMENTCONCEPT[0].Version[0]
    };
    dataElementConcept.concepts.push(concept);
    return dataElementConcept;
}
