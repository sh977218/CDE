import { transferClassifications } from 'shared/system/classificationShared';

const mergeBySources = (newSources, existingSources) => {
    let otherSources = existingSources.filter(o => ['PhenX', 'PhenX Variable'].indexOf(o.source) == -1);
    let result = newSources.concat(otherSources);
    return result;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeBySources(newCde.ids, existingCde.ids);
    existingCde.properties = mergeBySources(newCde.properties, existingCde.properties);
    existingCde.referenceDocuments = mergeBySources(newCde.referenceDocuments, existingCde.referenceDocuments);
    existingCde.sources = mergeBySources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
    transferClassifications(newCde, existingCde);
};
