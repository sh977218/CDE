function mergeSources(newSources, existingSources) {
    let otherSources = existingSources.filter(s => s.sourceName !== 'NINDS');
    let result = newSources.concat(otherSources);
    return result;
};

function mergeProperties(newProperties, existingProperties) {
    let otherSources = existingProperties.filter(s => s.source !== 'NINDS');
    let result = newProperties.concat(otherSources);
    return result;
};

function mergeReferenceDocuments(newReferenceDocuments, existingReferenceDocuments) {
    let otherSources = existingReferenceDocuments.filter(s => s.source !== 'NINDS');
    let result = newReferenceDocuments.concat(otherSources);
    return result;
};

function mergeIds(newIds, existingIds) {
    let idKeys = ['NINDS', 'NINDS Variable Name', 'NINDS caDSR', 'caDSR'];
    let otherSources = existingIds.filter(s => idKeys.indexOf(s.source) === -1);
    let result = newIds.concat(otherSources);
    return result;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeIds(newCde.ids, existingCde.ids);
    existingCde.properties = mergeProperties(newCde.properties, existingCde.properties);
    existingCde.referenceDocuments = mergeReferenceDocuments(newCde.referenceDocuments, existingCde.referenceDocuments);
    existingCde.sources = mergeSources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
};
