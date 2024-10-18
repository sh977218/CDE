import { eachLimit, parallel } from 'async';
import { find } from 'lodash';
import { PipelineStage } from 'mongoose';
import { byTinyId as deByTinyId, dataElementModel } from 'server/cde/mongo-cde';
import { respondError } from 'server/errorHandler';
import { byTinyId as formByTinyId, formModel } from 'server/form/mongo-form';
import { OrganizationDocument, orgByName } from 'server/orgManagement/orgDb';
import { addToClassifAudit } from 'server/system/classificationAuditSvc';
import { elasticsearchPromise } from 'server/system/elastic';
import { ItemDocument, removeJobStatus, updateJobStatus } from 'server/system/mongo-data';
import {
    addCategoriesToOrg,
    addCategoriesToTree,
    arrangeClassification,
    deleteCategory,
    findLeaf,
    mergeOrgClassificationAggregate,
    OrgClassificationAggregate,
    renameCategory,
} from 'shared/classification/classificationShared';
import { Classification, ItemClassification, ItemClassificationNew, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { buildElasticSearchQueryOrg } from 'server/system/buildElasticSearchQuery';

export function classifyItem(item: ItemDocument, orgName: string, categories: string[]): void {
    item.classification = defaultArray(item.classification);
    let classification = find(
        item.classification,
        (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName
    );
    if (!classification) {
        classification = {
            stewardOrg: { name: orgName },
            elements: [],
        };
        item.classification.push(classification);
    }
    addCategoriesToTree(classification, categories);
    arrangeClassification(item, orgName);
    if (item.markModified) {
        item.markModified('classification');
    }
}

export async function deleteOrgClassification(
    user: User,
    deleteClassification: ItemClassification,
    settings: SearchSettingsElastic
): Promise<void> {
    deleteClassification.categories = defaultArray(deleteClassification.categories);
    await updateJobStatus('deleteClassification', 'Running');

    const stewardOrg = await orgByName(deleteClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        return Promise.reject(new Error('not an organization: ' + deleteClassification.orgName));
    }
    const fakeTree = { elements: stewardOrg.classifications, stewardOrg: { name: '' } };
    deleteCategory(fakeTree, deleteClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();

    settings.selectedOrg = deleteClassification.orgName;
    settings.selectedElements = deleteClassification.categories;
    const query = buildElasticSearchQueryOrg(user, settings);
    return parallel([
        done =>
            elasticsearchPromise('cde', query).then(
                result => {
                    if (result && result.cdes && result.cdes.length > 0) {
                        const tinyIds = result.cdes.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async tinyId => {
                            const de = await deByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!de) {
                                throw new Error('not a de: ' + tinyId);
                            }
                            unclassifyElt(de, deleteClassification.orgName, deleteClassification.categories);
                            return de.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'cde' })),
                                action: 'delete',
                                path: [deleteClassification.orgName].concat(deleteClassification.categories),
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done();
                }
            ),
        done =>
            elasticsearchPromise('form', query).then(
                result => {
                    if (result && result.forms && result.forms.length > 0) {
                        const tinyIds = result.forms.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async (tinyId, cb) => {
                            const form = await formByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!form) {
                                throw new Error('not a form: ' + tinyId);
                            }
                            unclassifyElt(form, deleteClassification.orgName, deleteClassification.categories);
                            return form.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'form' })),
                                action: 'delete',
                                path: [deleteClassification.orgName].concat(deleteClassification.categories),
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done();
                }
            ),
    ]).then(
        () => {
            return removeJobStatus('deleteClassification').then();
        },
        err => {
            respondError()(err);
            return removeJobStatus('deleteClassification').then();
        }
    );
}

export async function renameOrgClassification(
    user: User,
    newClassification: ItemClassificationNew,
    settings: SearchSettingsElastic
): Promise<void> {
    newClassification.categories = defaultArray(newClassification.categories);
    updateJobStatus('renameClassification', 'Running');
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        return Promise.reject(new Error('not an organization: ' + newClassification.orgName));
    }
    const fakeTree = { elements: stewardOrg.classifications, stewardOrg: { name: '' } };
    renameCategory(fakeTree, newClassification.categories, newClassification.newName);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = newClassification.orgName;
    settings.selectedElements = newClassification.categories;
    const query = buildElasticSearchQueryOrg(user, settings);
    return parallel([
        done =>
            elasticsearchPromise('cde', query).then(
                result => {
                    /* istanbul ignore else */
                    if (result && result.cdes && result.cdes.length > 0) {
                        const tinyIds = result.cdes.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async tinyId => {
                            const de = await deByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!de) {
                                throw new Error('not a de: ' + tinyId);
                            }
                            renameClassifyElt(
                                de,
                                newClassification.orgName,
                                newClassification.categories,
                                newClassification.newName
                            );
                            return de.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'cde' })),
                                action: 'rename',
                                path: [newClassification.orgName].concat(newClassification.categories),
                                newname: newClassification.newName,
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done();
                }
            ),
        done =>
            elasticsearchPromise('form', query).then(
                result => {
                    /* istanbul ignore else */
                    if (result && result.forms && result.forms.length > 0) {
                        const tinyIds = result.forms.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async tinyId => {
                            const form = await formByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!form) {
                                throw new Error('not a form: ' + tinyId);
                            }
                            renameClassifyElt(
                                form,
                                newClassification.orgName,
                                newClassification.categories,
                                newClassification.newName
                            );
                            return form.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'form' })),
                                action: 'rename',
                                path: [newClassification.orgName].concat(newClassification.categories),
                                newname: newClassification.newName,
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done();
                }
            ),
    ]).then(
        () => {
            return removeJobStatus('renameClassification').then();
        },
        err => {
            respondError()(err);
            return removeJobStatus('renameClassification').then();
        }
    );
}

export async function addOrgClassification(
    newClassification: ItemClassification
): Promise<OrganizationDocument | null> {
    newClassification.categories = defaultArray(newClassification.categories);
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        return Promise.reject(new Error('not an organization: ' + newClassification.orgName));
    }
    addCategoriesToOrg(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    return stewardOrg.save();
}

export async function reclassifyOrgClassification(
    user: User,
    oldClassification: ItemClassification,
    newClassification: ItemClassification,
    settings: SearchSettingsElastic
): Promise<void> {
    oldClassification.categories = defaultArray(oldClassification.categories);
    newClassification.categories = defaultArray(newClassification.categories);
    await updateJobStatus('reclassifyClassification', 'Running');
    const stewardOrg = await orgByName(newClassification.orgName);
    /* istanbul ignore if */
    if (!stewardOrg) {
        return Promise.reject(new Error('not an organization: ' + newClassification.orgName));
    }
    addCategoriesToOrg(stewardOrg, newClassification.categories);
    stewardOrg.markModified('classifications');
    await stewardOrg.save();
    settings.selectedOrg = oldClassification.orgName;
    settings.selectedElements = oldClassification.categories;
    const query = buildElasticSearchQueryOrg(user, settings);
    return parallel([
        done =>
            elasticsearchPromise('cde', query).then(
                result => {
                    if (result && result.cdes && result.cdes.length > 0) {
                        const tinyIds = result.cdes.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async tinyId => {
                            const de = await deByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!de) {
                                throw new Error('not a de: ' + tinyId);
                            }
                            classifyItem(de, newClassification.orgName, newClassification.categories);
                            return de.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'cde' })),
                                action: 'reclassify',
                                path: [newClassification.orgName].concat(newClassification.categories),
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done(err);
                }
            ),
        done =>
            elasticsearchPromise('form', query).then(
                result => {
                    if (result && result.forms && result.forms.length > 0) {
                        const tinyIds = result.forms.map(c => c.tinyId);
                        eachLimit(tinyIds, 100, async tinyId => {
                            const form = await formByTinyId(tinyId);
                            /* istanbul ignore if */
                            if (!form) {
                                throw new Error('not a form: ' + tinyId);
                            }
                            classifyItem(form, newClassification.orgName, newClassification.categories);
                            return form.save();
                        }).then(() => {
                            done();
                            addToClassifAudit({
                                date: new Date(),
                                user,
                                elements: tinyIds.map(e => ({ tinyId: e, eltType: 'form' })),
                                action: 'reclassify',
                                path: [newClassification.orgName].concat(newClassification.categories),
                            });
                        }, done);
                    } else {
                        done();
                    }
                },
                err => {
                    respondError()(err);
                    done();
                }
            ),
    ]).then(
        () => {
            return removeJobStatus('reclassifyClassification').then();
        },
        err => {
            respondError()(err);
            return removeJobStatus('reclassifyClassification').then();
        }
    );
}

export function renameClassifyElt(item: ItemDocument, orgName: string, categories: string[], newName: string): void {
    item.classification = defaultArray(item.classification);
    const classification = find(
        item.classification,
        (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName
    );
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
    const classification = find(
        item.classification,
        (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName
    );
    if (classification) {
        const leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            item.markModified('classification');
        }
    }
}

export async function updateOrgClassification(orgName: string): Promise<any[]> {
    const aggregate: PipelineStage[] = [
        { $match: { archived: false, 'classification.stewardOrg.name': orgName } },
        { $unwind: '$classification' },
        { $match: { archived: false, 'classification.stewardOrg.name': orgName } },
        { $group: { _id: { name: '$classification.stewardOrg.name', elements: '$classification.elements' } as any } },
    ];
    const cdeClassificationsAggregate: OrgClassificationAggregate[] = await dataElementModel.aggregate(aggregate);
    const formClassificationsAggregate: OrgClassificationAggregate[] = await formModel.aggregate(aggregate);
    return mergeOrgClassificationAggregate(cdeClassificationsAggregate, formClassificationsAggregate);
}

function defaultArray<T>(arr?: T[]): T[] {
    return arr || [];
}
