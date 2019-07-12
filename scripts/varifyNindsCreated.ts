import { diff as deepDiff } from 'deep-diff';
import { sortBy } from 'lodash';
import { sortClassification } from 'shared/system/classificationShared';
import { batchloader, BATCHLOADER_USERNAME } from '../ingester/shared/updatedByNonLoader';
import { DataElement, DataElementSource } from 'server/cde/mongo-cde';
import { Form, FormSource } from 'server/form/mongo-form';

const ignoreProperties = ['PublicDomain', 'CopyrightStarted'];

let cond = {
    'archived': false,
    'registrationState.registrationStatus': {$ne: 'Retired'},
    'classification.stewardOrg.name': 'NINDS',
    'classification.elements.name': {$ne: 'Preclinical TBI'}
};

[
    {
        model: DataElement,
        source: DataElementSource,
        count: 0
    },
    {
        model: Form,
        source: FormSource,
        count: 0,
    }
].forEach(obj => {
    obj.model.find(cond, async (err, elements) => {
        if (err) throw (err);
        for (let element of elements) {
            if (element.updatedBy.username === BATCHLOADER_USERNAME) {
                let type = element.elementType;
                let elementJson = element.toObject();
                let source = await obj.source.findOne({'ids.id': elementJson.ids[0].id});
                if (!source || !elementJson) {
                    console.log(type + ' ' + elementJson.tinyId + ' with id ' + elementJson.ids[0].id + ' not in source.');
                } else {
                    source.tinyId = elementJson.tinyId;
                    let sourceJson = source.toObject();
                    [sourceJson, elementJson].forEach(o => {
                        delete o.source;
                        delete o._id;
                        delete o.created;
                        delete o.createdBy;
                        delete o.imported;
                        delete o.updated;
                        delete o.updatedBy;
                        delete o.__v;
                        delete o.views;
                        delete o.comments;
                        delete o.sources;
                        delete o.version;
                        delete o.mappingSpecifications;
                        delete o.formElements;
                        delete o.history;
                        delete o.changeNote;
                        delete o.lastMigrationScript;
                        let nindsClassification = o.classification.filter(c => c.stewardOrg.name === 'NINDS');
                        o.classification = nindsClassification;
                        sortClassification(o);

                        o.designations.forEach(d => d.tags.sort());
                        o.ids.forEach(i => delete i._id);
                        o.designations = sortBy(o.designations, 'designation');
                        o.definitions = sortBy(o.definitions, 'definition');


                        // https://jira.nlm.nih.gov/browse/CDEP-13
                        o.properties = o.properties.filter(o => o.key && ignoreProperties.indexOf(o.key) === -1);

                        o.properties = sortBy(o.properties, 'key');
                        if (type === 'cde') {
                            delete o.valueDomain.uom;
                            o.referenceDocuments = sortBy(o.referenceDocuments, 'document');
                        }
                        if (type === 'form') {
                            //@TODO remove it after
                            delete o.isCopyrighted;
                            delete o.noRenderAllowed;

                            delete o.definitions;
                            delete o.displayProfiles;
                            o.referenceDocuments = sortBy(o.referenceDocuments, 'uri');
                        }
                        o.ids = sortBy(o.ids, 'source');
                    });
                    let changes = deepDiff(sourceJson, elementJson);
                    if (changes) {
                        console.log(type + ' ' + elementJson.tinyId + ' is different from source');
                        process.exit(1);
                    }
                    //@TODO add it after;
                    if (!element.createdBy) element.createdBy = batchloader;
                    element.isCopyrighted = sourceJson.isCopyrighted;
                    element.noRenderAllowed = sourceJson.noRenderAllowed;
                    element.save(() => {
                        obj.count++;
                        console.log(type + ' Count: ' + obj.count);
                    });
                }
            }
        }
    });
});
