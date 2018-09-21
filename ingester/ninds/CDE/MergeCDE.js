const _ = require('lodash');

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

mergeSources = (o1, o2) => {
    let result = _.uniqBy(o1.concat(o2), 'sourceName');
    return result;
};

mergePermissibleValues = (o1, o2) => {
    let fullList = _.concat(o1.valueDomain.permissibleValues, o2.valueDomain.permissibleValues);
    let uniqueList = _.uniqWith(fullList,
        (a, b) => a.permissibleValue === b.permissibleValue
            && a.valueMeaningDefinition === b.valueMeaningDefinition
            && a.valueMeaningName === b.valueMeaningName
            && a.codeSystemName === b.codeSystemName);
    return uniqueList;
};

exports.mergeCde = (existingCde, newCde) => {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = newCde.ids;
    existingCde.properties = newCde.properties;
    existingCde.referenceDocuments = newCde.referenceDocuments;
    existingCde.sources = mergeSources(newCde.sources, existingCde.sources);
    existingCde.valueDomain = newCde.valueDomain;
    classificationShared.transferClassifications(newCde, existingCde);
};
