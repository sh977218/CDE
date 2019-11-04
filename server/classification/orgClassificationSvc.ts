import { find } from 'lodash';
import { byTinyId as deByTinyId, dataElementModel } from 'server/cde/mongo-cde';
import { handleError } from 'server/errorHandler/errorHandler';
import { byTinyId as formByTinyId, formModel } from 'server/form/mongo-form';
import { buildElasticSearchQuery, elasticsearch } from 'server/system/elastic';
import { ItemDocument, removeJobStatus, updateJobStatus } from 'server/system/mongo-data';
import { Classification } from 'shared/models.model';
import {
    addCategoriesToOrg, addCategoriesToTree, arrangeClassification, deleteCategory, findLeaf, mergeOrgClassifications,
    OrgClassification, renameCategory,
} from 'shared/system/classificationShared';
import { orgByName } from 'server/orgManagement/orgDb';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';

const async = require('async');

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
    item.markModified('classification');
}

export async function deleteOrgClassification(user, deleteClassification, settings, callback) {
    if (!(deleteClassification.categories instanceof Array)) {
        deleteClassification.categories = [deleteClassification.categories];
    }
    await updateJobStatus('deleteClassification', 'Running');

    const stewardOrg = await orgByName(deleteClassification.orgName);
    const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
    deleteCategory(fakeTree, deleteClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();

    settings.selectedOrg = deleteClassification.orgName;
    settings.selectedElements = deleteClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    async.parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    unclassifyElt(de, deleteClassification.orgName, deleteClassification.categories);
                    de.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                        action: 'delete',
                        path: [deleteClassification.orgName].concat(deleteClassification.categories)
                    });
                });
            } else {
                done();
            }
        })),
        done => elasticsearch('form', query, settings, handleError({}, result => {
            if (result && result.forms && result.forms.length > 0) {
                const tinyIds = result.forms.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    unclassifyElt(form, deleteClassification.orgName, deleteClassification.categories);
                    form.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                        action: 'delete',
                        path: [deleteClassification.orgName].concat(deleteClassification.categories)
                    });
                });
            } else {
                done();
            }
        }))
    ], handleError({}, () => {
        removeJobStatus('deleteClassification', callback);
    }));
}

export async function renameOrgClassification(user, newClassification, settings, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    updateJobStatus('renameClassification', 'Running');
    const stewardOrg = await orgByName(newClassification.orgName);
    const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
    renameCategory(fakeTree, newClassification.categories, newClassification.newName);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = newClassification.orgName;
    settings.selectedElements = newClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    async.parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    renameClassifyElt(de, newClassification.orgName,
                        newClassification.categories, newClassification.newName);
                    de.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                        action: 'rename',
                        path: [newClassification.orgName].concat(newClassification.categories),
                        newname: newClassification.newName
                    });
                });
            } else {
                done();
            }
        })),
        done => elasticsearch('form', query, settings, handleError({}, result => {
            if (result && result.forms && result.forms.length > 0) {
                const tinyIds = result.forms.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    renameClassifyElt(form, newClassification.orgName,
                        newClassification.categories, newClassification.newName);
                    form.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                        action: 'rename',
                        path: [newClassification.orgName].concat(newClassification.categories),
                        newname: newClassification.newName
                    });
                });
            } else {
                done();
            }
        }))
    ], handleError({}, () => removeJobStatus('renameClassification', callback)));
}

export async function addOrgClassification(newClassification, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    const stewardOrg = await orgByName(newClassification.orgName);
    addCategoriesToOrg(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    stewardOrg.save(callback);
}

export async function reclassifyOrgClassification(user, oldClassification, newClassification, settings, callback) {
    if (!(oldClassification.categories instanceof Array)) {
        oldClassification.categories = [oldClassification.categories];
    }
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    await updateJobStatus('reclassifyClassification', 'Running');
    const stewardOrg: any = await orgByName(newClassification.orgName);
    addCategoriesToTree(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = oldClassification.orgName;
    settings.selectedElements = oldClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    async.parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    classifyItem(de, newClassification.orgName, newClassification.categories);
                    de.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'cde'})),
                        action: 'reclassify',
                        path: [newClassification.orgName].concat(newClassification.categories)
                    });
                });
            } else {
                done();
            }
        })),
        done => elasticsearch('form', query, settings, handleError({}, result => {
            if (result && result.forms && result.forms.length > 0) {
                const tinyIds = result.forms.map(c => c.tinyId);
                async.eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    classifyItem(form, newClassification.orgName, newClassification.categories);
                    form.save(doneOne);
                }, () => {
                    done();
                    addToClassifAudit({
                        date: new Date(),
                        user,
                        elements: tinyIds.map(e => ({tinyId: e, eltType: 'form'})),
                        action: 'reclassify',
                        path: [newClassification.orgName].concat(newClassification.categories)
                    });
                });
            } else {
                done();
            }
        }))
    ], handleError({}, () => removeJobStatus('reclassifyClassification', callback)));
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
            item.markModified('classification');
        }
    }
}

export function unclassifyElt(item: ItemDocument, orgName: string, categories: string[]): any {
    const classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (classification) {
        const leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            item.markModified('classification');
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
