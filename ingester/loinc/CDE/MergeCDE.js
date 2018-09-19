const _ = require('lodash');
const cdediff = require('../../../server/cde/cdediff');
const wipeUseless = require('../Utility/utility').wipeUseless;
const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

exports.compareCdes = function (newCde, existingCde) {
    let newCdeObj = _.cloneDeep(newCde);
    if (newCdeObj.toObject) newCdeObj = newCdeObj.toObject();
    let existingCdeObj = _.cloneDeep(existingCde);
    if (existingCdeObj.toObject) existingCdeObj = existingCdeObj.toObject();

    [existingCdeObj, newCdeObj].forEach(obj => {
        obj.ids.sort((a, b) => a.source > b.source);
        obj.properties.sort((a, b) => a.key > b.key);
        delete obj.classification;
        wipeUseless(obj);
    });
    return cdediff.diff(existingCde, newCde);
};
mergeDesignations = (o1, o2) => {
    let result = _.uniqWith(o1.concat(o2), (a, b) => {
        if (a.designation === b.designation) {
            a.tags = _.uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });
    return result;
};
mergeDefinitions = (o1, o2) => {
    let result = _.uniqWith(o1.concat(o2), (a, b) => {
        if (a.definition === b.definition && a.definitionFormat === b.definitionFormat) {
            a.tags = _.uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });
    return result;
};
mergeSources = (o1, o2) => {
    let result = _.uniqBy(o1.concat(o2), 'sourceName');
    return result;
};
mergeWithEqual = (o1, o2) => {
    let result = _.uniqWith(o1.concat(o2), _.isEqual);
    return result;
};
exports.mergeCde = function (newCde, existingCde) {
    existingCde.designations = mergeDesignations(existingCde.designations, newCde.designations);
    existingCde.definitios = mergeDefinitions(existingCde.definitions, newCde.definitions);
    existingCde.sources = mergeSources(existingCde.sources, newCde.sources);
    existingCde.property = newCde.property;
    existingCde.valueDomain = newCde.valueDomain;
    existingCde.mappingSpecifications = newCde.mappingSpecifications;
    existingCde.referenceDocuments = mergeWithEqual(existingCde.referenceDocuments, newCde.referenceDocuments);
    existingCde.properties = mergeWithEqual(existingCde.properties, newCde.properties);
    existingCde.ids = mergeWithEqual(existingCde.ids, newCde.ids);
    classificationShared.transferClassifications(newCde, existingCde);
};