import { mergeBySources, mergeSourcesBySourceName, replaceClassificationByOrg } from 'ingester/shared/utility';
import { transferClassifications } from 'shared/system/classificationShared';

export function mergeCde(existingCde, newCde) {
    let sourceNames = ['PhenX', 'PhenX Variable'];
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeBySources(newCde.ids, existingCde.ids, sourceNames);
    existingCde.properties = mergeBySources(newCde.properties, existingCde.properties, sourceNames);
    existingCde.referenceDocuments = mergeBySources(newCde.referenceDocuments, existingCde.referenceDocuments, sourceNames);
    existingCde.sources = mergeSourcesBySourceName(newCde.sources, existingCde.sources, sourceNames);
    existingCde.valueDomain = newCde.valueDomain;
    if (existingCde.lastMigrationScript === 'loadPhenXJuly2019') {
        transferClassifications(newCde, existingCde);
    } else {
        existingCde.classification = replaceClassificationByOrg(newCde.classification, existingCde.classification, 'PhenX');
    }
}