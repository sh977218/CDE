
function mergeCde(existingCde, newCde) {
    updateShare.mergeNaming(newCde, existingCde);
    updateShare.mergeSources(newCde, existingCde);
    updateShare.mergeIds(newCde, existingCde);
    updateShare.mergeProperties(newCde, existingCde);
    updateShare.mergeReferenceDocument(newCde, existingCde);

    // PermissibleValues
    if (newCde.valueDomain.datatype === 'Value List' && existingCde.valueDomain.datatype === 'Value List') {
        let fullList = _.concat(existingCde.valueDomain.permissibleValues, newCde.valueDomain.permissibleValues);
        let uniqueList = _.uniqWith(fullList,
            (a, b) => a.permissibleValue === b.permissibleValue
                && a.valueMeaningDefinition === b.valueMeaningDefinition
                && a.valueMeaningName === b.valueMeaningName
                && a.codeSystemName === b.codeSystemName);
        existingCde.valueDomain.permissibleValues = uniqueList;
        existingCde.markModified("valueDomain");
    } else if (newCde.valueDomain.datatype !== 'Value List' && existingCde.valueDomain.datatype !== 'Value List') {
        // do NOT remove this condition. it has its special purpose.
    } else {
        console.log("newCde datatype: " + newCde.valueDomain.datatype);
        console.log("existingCde datatype: " + existingCde.valueDomain.datatype);
        process.exit(1);
    }
    existingCde.created = today;
    classificationShared.transferClassifications(newCde, existingCde);
}
