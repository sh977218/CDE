import { cloneDeep, isEmpty } from 'lodash';
import { diff as deepDiff } from 'deep-diff';
import { transferClassifications } from '../../../shared/system/classificationShared';
import { replaceClassificationByOrg } from 'ingester/phenx/Form/form';

export function compareCde(newCde, existingCde) {
    let newCdeObj = cloneDeep(newCde);
    if (newCdeObj.toObject) newCdeObj = newCdeObj.toObject();
    let existingCdeObj = cloneDeep(existingCde);
    if (existingCdeObj.toObject) existingCdeObj = existingCdeObj.toObject();

    [existingCdeObj, newCdeObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);
        delete obj._id;
        delete obj.__v;
        delete obj.version;
        delete obj.tinyId;
        delete obj.imported;
        delete obj.created;
        delete obj.createdBy;
        delete obj.updated;
        delete obj.updatedBy;
        delete obj.changeNote;
        delete obj.source;
        delete obj.archived;
        delete obj.views;
        delete obj.sources;

        delete obj.naming;
        delete obj.classification;
        delete obj.attachments;
        delete obj.mappingSpecifications;
        delete obj.derivationRules;
        delete obj.lastMigrationScript;
        delete obj.registrationState;
        delete obj.history;
        delete obj.comments;

        if (!obj.valueDomain.uom) delete obj.valueDomain.uom;

        obj.referenceDocuments.forEach(a => {
            for (let p in a) {
                if (isEmpty(a[p])) delete a[p];
            }
        });
    });
    let result = deepDiff(existingCdeObj, newCdeObj);
    return result;
}

function mergeBySources(newSources, existingSources) {
    let otherSources = existingSources.filter(o => ['PhenX', 'PhenX Variable'].indexOf(o.source) === -1);
    return newSources.concat(otherSources);
}

export function mergeCde(existingCde, newCde) {
    existingCde.designations = newCde.designations;
    existingCde.definitions = newCde.definitions;
    existingCde.ids = mergeBySources(newCde.ids, existingCde.ids);
    existingCde.properties = mergeBySources(newCde.properties, existingCde.properties);
    existingCde.referenceDocuments = mergeBySources(newCde.referenceDocuments, existingCde.referenceDocuments);
    existingCde.sources = mergeBySources(newCde.sources, existingCde.sources);
    existingCde.classification = replaceClassificationByOrg(newCde.classification, existingCde.classification);
    existingCde.valueDomain = newCde.valueDomain;
}