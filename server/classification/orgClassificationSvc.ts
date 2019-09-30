import { find } from 'lodash';
import { byTinyId as deByTinyId, dataElementModel } from 'server/cde/mongo-cde';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { byTinyId as formByTinyId, formModel } from 'server/form/mongo-form';
import { buildElasticSearchQuery, elasticsearch } from 'server/system/elastic';
import { ItemDocument } from 'server/system/mongo-data';
import { Classification, Item } from 'shared/models.model';
import {
    addCategoriesToOrg, addCategoriesToTree, arrangeClassification, deleteCategory, findLeaf, mergeOrgClassifications,
    OrgClassification, renameCategory,
} from 'shared/system/classificationShared';

const async = require('async');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('../system/mongo-data');

export function classifyItem(item: ItemDocument, orgName: string, categories: string[]): void {
    if (!item.classification) {
        item.classification = [];
    }
    let classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (!classification) {
        classification = {
            stewardOrg: {name: orgName},
            elements: []
        };
        item.classification.push(classification);
    }
    addCategoriesToTree(classification, categories);
    arrangeClassification(item, orgName);
    if (item.markModified) {
        item.markModified('classification');
    }
}

export function deleteOrgClassification(user, deleteClassification, settings, callback) {
    if (!(deleteClassification.categories instanceof Array)) {
        deleteClassification.categories = [deleteClassification.categories];
    }
    mongo_data.updateJobStatus('deleteClassification', 'Running', err => {
        if (err) {
            return callback(err);
        }
        mongo_data.orgByName(deleteClassification.orgName, (err, stewardOrg) => {
            if (err) { return callback(err, stewardOrg); }
            const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
            deleteCategory(fakeTree, deleteClassification.categories);
            stewardOrg.markModified('classifications');
            stewardOrg.save(err => {
                if (err) {
                    return callback(err, stewardOrg);
                }
                settings.selectedOrg = deleteClassification.orgName;
                settings.selectedElements = deleteClassification.categories;
                const query = buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elasticsearch('cde', query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            const tinyIds = result.cdes.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                deByTinyId(tinyId, (err, de) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    unclassifyElt(de, deleteClassification.orgName, deleteClassification.categories);
                                    de.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                                    action: 'delete',
                                    path: [deleteClassification.orgName].concat(deleteClassification.categories)
                                });
                            });
                        } else { done(); }
                    })),
                    done => elasticsearch('form', query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            const tinyIds = result.forms.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                formByTinyId(tinyId, (err, form) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    unclassifyElt(form, deleteClassification.orgName, deleteClassification.categories);
                                    form.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                                    action: 'delete',
                                    path: [deleteClassification.orgName].concat(deleteClassification.categories)
                                });
                            });
                        } else { done(); }
                    }))
                ], handleError({}, () => {
                    mongo_data.removeJobStatus('deleteClassification', callback);
                }));
            });
        });
    });
}

export function renameOrgClassification(user, newClassification, settings, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    mongo_data.updateJobStatus('renameClassification', 'Running', err => {
        if (err) {
            return callback(err);
        }
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) { return callback(err, stewardOrg); }
            const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
            renameCategory(fakeTree, newClassification.categories, newClassification.newName);
            stewardOrg.markModified('classifications');
            stewardOrg.save(err => {
                if (err) { return callback(err, stewardOrg); }
                settings.selectedOrg = newClassification.orgName;
                settings.selectedElements = newClassification.categories;
                const query = buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elasticsearch('cde', query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            const tinyIds = result.cdes.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                deByTinyId(tinyId, (err, de) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    renameClassifyElt(de, newClassification.orgName,
                                        newClassification.categories, newClassification.newName);
                                    de.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                                    action: 'rename',
                                    path: [newClassification.orgName].concat(newClassification.categories),
                                    newname: newClassification.newName
                                });
                            });
                        } else { done(); }
                    })),
                    done => elasticsearch('form', query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            const tinyIds = result.forms.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                formByTinyId(tinyId, (err, form) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    renameClassifyElt(form, newClassification.orgName,
                                        newClassification.categories, newClassification.newName);
                                    form.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                                    action: 'rename',
                                    path: [newClassification.orgName].concat(newClassification.categories),
                                    newname: newClassification.newName
                                });
                            });
                        } else { done(); }
                    }))
                ], handleError({}, () => mongo_data.removeJobStatus('renameClassification', callback)));
            });
        });
    });
}

export function addOrgClassification(newClassification, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
        if (err) { return callback(err, stewardOrg); }
        addCategoriesToOrg(stewardOrg, newClassification.categories);
        stewardOrg.markModified('classifications');
        stewardOrg.save(callback);
    });
}

export function reclassifyOrgClassification(user, oldClassification, newClassification, settings, callback) {
    if (!(oldClassification.categories instanceof Array)) { oldClassification.categories = [oldClassification.categories]; }
    if (!(newClassification.categories instanceof Array)) { newClassification.categories = [newClassification.categories]; }
    mongo_data.updateJobStatus('reclassifyClassification', 'Running', err => {
        if (err) { return callback(err); }
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) { return callback(err, stewardOrg); }
            addCategoriesToTree(stewardOrg, newClassification.categories);
            stewardOrg.markModified('classifications');
            stewardOrg.save(err => {
                if (err) { return callback(err, stewardOrg); }
                settings.selectedOrg = oldClassification.orgName;
                settings.selectedElements = oldClassification.categories;
                const query = buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elasticsearch('cde', query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            const tinyIds = result.cdes.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                deByTinyId(tinyId, (err, form) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    classifyItem(form, newClassification.orgName, newClassification.categories);
                                    form.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                                    action: 'reclassify',
                                    path: [newClassification.orgName].concat(newClassification.categories)
                                });
                            });
                        } else { done(); }
                    })),
                    done => elasticsearch('form', query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            const tinyIds = result.forms.map(c => c.tinyId);
                            async.eachLimit(tinyIds, 100, (tinyId, doneOne) => {
                                formByTinyId(tinyId, (err, de) => {
                                    if (err) {
                                        return doneOne(err);
                                    }
                                    classifyItem(de, newClassification.orgName, newClassification.categories);
                                    de.save(doneOne);
                                });
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user,
                                    elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                                    action: 'reclassify',
                                    path: [newClassification.orgName].concat(newClassification.categories)
                                });
                            });
                        } else { done(); }
                    }))
                ], handleError({}, () => mongo_data.removeJobStatus('reclassifyClassification', callback)));
            });
        });
    });
}

export function renameClassifyElt(item: ItemDocument, orgName: string, categories: string[], newName: string): void {
    if (!item.classification) {
        item.classification = [];
    }
    const classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (classification) {
        const leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.leaf.name = newName;
            arrangeClassification(item, orgName);
            if (item.markModified) {
                item.markModified('classification');
            }
        }
    }
}

export function unclassifyElt(item: ItemDocument, orgName: string, categories: string[]): any {
    const classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (classification) {
        const leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            if (item.markModified) {
                item.markModified('classification');
            }
        }
    }
}

export async function updateOrgClassification(orgName): Promise<any[]> {
    const aggregate = [
        {$match: {archived: false, 'classification.stewardOrg.name': orgName}},
        {$unwind: '$classification'},
        {$match: {archived: false, 'classification.stewardOrg.name': orgName}},
        {$group: {_id: '$classification.stewardOrg.name', elements: {$addToSet: '$classification'}}}
    ];
    const cdeClassifications: OrgClassification[] = await dataElementModel.aggregate(aggregate);
    const formClassifications: OrgClassification[] = await formModel.aggregate(aggregate);
    return mergeOrgClassifications(cdeClassifications, formClassifications);
}
