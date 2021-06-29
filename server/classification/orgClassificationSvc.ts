import { eachLimit, parallel } from 'async';
import { find } from 'lodash';
import { byTinyId as deByTinyId, dataElementModel } from 'server/cde/mongo-cde';
import { handleError, handleErrorVoid, respondError } from 'server/errorHandler/errorHandler';
import { byTinyId as formByTinyId, formModel } from 'server/form/mongo-form';
import { OrganizationDocument, orgByName } from 'server/orgManagement/orgDb';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { elasticsearch } from 'server/system/elastic';
import { ItemDocument, removeJobStatus, updateJobStatus } from 'server/system/mongo-data';
import { CbError, CbError1, Classification, ItemClassification, ItemClassificationNew, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import {
    addCategoriesToOrg, addCategoriesToTree, arrangeClassification, deleteCategory, findLeaf, mergeOrgClassifications,
    OrgClassification, renameCategory,
} from 'shared/system/classificationShared';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';

export function classifyItem(item: ItemDocument, orgName: string, categories: string[]): void {
    item.classification = defaultArray(item.classification);
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

export async function deleteOrgClassification(user: User, deleteClassification: ItemClassification, settings: SearchSettingsElastic,
                                              callback: CbError) {
    deleteClassification.categories = defaultArray(deleteClassification.categories);
    await updateJobStatus('deleteClassification', 'Running');

    const stewardOrg = await orgByName(deleteClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        callback(new Error('not an organization: ' + deleteClassification.orgName));
        return;
    }
    const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
    deleteCategory(fakeTree, deleteClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();

    settings.selectedOrg = deleteClassification.orgName;
    settings.selectedElements = deleteClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!de) {
                        callback(new Error('not a de: ' + tinyId));
                        return;
                    }
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
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!form) {
                        callback(new Error('not a form: ' + tinyId));
                        return;
                    }
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
    ], (err?: Error | null) => {
        if (err) {
            respondError(err);
            return;
        }
        removeJobStatus('deleteClassification', callback);
    });
}

export async function renameOrgClassification(user: User, newClassification: ItemClassificationNew, settings: SearchSettingsElastic,
                                              callback: CbError) {
    newClassification.categories = defaultArray(newClassification.categories);
    updateJobStatus('renameClassification', 'Running');
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        callback(new Error('not an organization: ' + newClassification.orgName));
        return;
    }
    const fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
    renameCategory(fakeTree, newClassification.categories, newClassification.newName);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = newClassification.orgName;
    settings.selectedElements = newClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            /* istanbul ignore else */
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!de) {
                        callback(new Error('not a de: ' + tinyId));
                        return;
                    }
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
            /* istanbul ignore else */
            if (result && result.forms && result.forms.length > 0) {
                const tinyIds = result.forms.map(c => c.tinyId);
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!form) {
                        callback(new Error('not a form: ' + tinyId));
                        return;
                    }
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
    ], (err?: Error | null) => {
        if (err) {
            respondError(err);
            return;
        }
        removeJobStatus('renameClassification', callback);
    });
}

export async function addOrgClassification(newClassification: ItemClassification, callback: CbError1<OrganizationDocument | void>) {
    newClassification.categories = defaultArray(newClassification.categories);
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        callback(new Error('not an organization: ' + newClassification.orgName));
        return;
    }
    addCategoriesToOrg(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    stewardOrg.save(callback);
}

export async function reclassifyOrgClassification(user: User, oldClassification: ItemClassification,
                                                  newClassification: ItemClassification, settings: SearchSettingsElastic,
                                                  callback: CbError) {
    oldClassification.categories = defaultArray(oldClassification.categories);
    newClassification.categories = defaultArray(newClassification.categories);
    await updateJobStatus('reclassifyClassification', 'Running');
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        callback(new Error('not an organization: ' + newClassification.orgName));
        return;
    }
    addCategoriesToOrg(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = oldClassification.orgName;
    settings.selectedElements = oldClassification.categories;
    const query = buildElasticSearchQuery(user, settings);
    parallel([
        done => elasticsearch('cde', query, settings, handleError({}, result => {
            if (result && result.cdes && result.cdes.length > 0) {
                const tinyIds = result.cdes.map(c => c.tinyId);
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const de = await deByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!de) {
                        callback(new Error('not a de: ' + tinyId));
                        return;
                    }
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
                eachLimit(tinyIds, 100, async (tinyId, doneOne) => {
                    const form = await formByTinyId(tinyId);
                    /* istanbul ignore if */
                    if (!form) {
                        callback(new Error('not a form: ' + tinyId));
                        return;
                    }
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
    ], (err?: Error | null) => {
        if (err) {
            respondError(err);
            return;
        }
        removeJobStatus('reclassifyClassification', callback)
    });
}

export function renameClassifyElt(item: ItemDocument, orgName: string, categories: string[], newName: string): void {
    item.classification = defaultArray(item.classification);
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

export async function updateOrgClassification(orgName: string): Promise<any[]> {
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

function defaultArray<T>(arr?: T[]): T[] {
    return arr || [];
}
