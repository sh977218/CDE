import {
    addCategoriesToOrg, addCategoriesToTree, classifyItem, deleteCategory, mergeOrgClassifications, OrgClassification,
    renameCategory, renameClassifyElt, unclassifyElt
} from 'shared/system/classificationShared';
import { DataElement } from 'server/cde/mongo-cde';
import { Form } from 'server/form/mongo-form';
import { handleError } from '../errorHandler/errorHandler';

const async = require('async');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('../system/mongo-data');
const elastic = require('../system/elastic');

export function deleteOrgClassification(user, deleteClassification, settings, callback) {
    if (!(deleteClassification.categories instanceof Array)) {
        deleteClassification.categories = [deleteClassification.categories];
    }
    mongo_data.updateJobStatus('deleteClassification', "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(deleteClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
            deleteCategory(fakeTree, deleteClassification.categories);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = deleteClassification.orgName;
                settings.selectedElements = deleteClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch('cde', query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, handleError({}, de => {
                                    unclassifyElt(de, deleteClassification.orgName, deleteClassification.categories);
                                    de.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "cde"};
                                    }),
                                    action: "delete",
                                    path: [deleteClassification.orgName].concat(deleteClassification.categories)
                                });
                            });
                        } else done();
                    })),
                    done => elastic.elasticsearch("form", query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.forms.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, handleError({}, form => {
                                    unclassifyElt(form, deleteClassification.orgName, deleteClassification.categories);
                                    form.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "form"};
                                    }),
                                    action: "delete",
                                    path: [deleteClassification.orgName].concat(deleteClassification.categories)
                                });
                            });
                        } else done();
                    }))
                ], handleError({}, () => {
                    mongo_data.removeJobStatus("deleteClassification", callback);
                }));
            });
        });
    });
}

export function renameOrgClassification(user, newClassification, settings, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    mongo_data.updateJobStatus("renameClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications, stewardOrg: {name: ''}};
            renameCategory(fakeTree, newClassification.categories, newClassification.newName);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = newClassification.orgName;
                settings.selectedElements = newClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch("cde", query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, handleError({}, de => {
                                    renameClassifyElt(de, newClassification.orgName, newClassification.categories, newClassification.newName);
                                    de.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "cde"};
                                    }),
                                    action: "rename",
                                    path: [newClassification.orgName].concat(newClassification.categories),
                                    newname: newClassification.newName
                                });
                            });
                        } else done();
                    })),
                    done => elastic.elasticsearch("form", query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.forms.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, handleError({}, form => {
                                    renameClassifyElt(form, newClassification.orgName, newClassification.categories, newClassification.newName);
                                    form.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "form"};
                                    }),
                                    action: "rename",
                                    path: [newClassification.orgName].concat(newClassification.categories),
                                    newname: newClassification.newName
                                });
                            });
                        } else done();
                    }))
                ], handleError({}, () => mongo_data.removeJobStatus("renameClassification", callback)));
            });
        });
    });
}

export function addOrgClassification(newClassification, callback) {
    if (!(newClassification.categories instanceof Array)) {
        newClassification.categories = [newClassification.categories];
    }
    mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
        if (err) return callback(err, stewardOrg);
        addCategoriesToOrg(stewardOrg, newClassification.categories);
        stewardOrg.markModified("classifications");
        stewardOrg.save(callback);
    });
}

export function reclassifyOrgClassification(user, oldClassification, newClassification, settings, callback) {
    if (!(oldClassification.categories instanceof Array)) oldClassification.categories = [oldClassification.categories];
    if (!(newClassification.categories instanceof Array)) newClassification.categories = [newClassification.categories];
    mongo_data.updateJobStatus("reclassifyClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            addCategoriesToTree(stewardOrg, newClassification.categories);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = oldClassification.orgName;
                settings.selectedElements = oldClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch("cde", query, settings, handleError({}, result => {
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, handleError({}, de => {
                                    classifyItem(de, newClassification.orgName, newClassification.categories);
                                    de.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "cde"};
                                    }),
                                    action: "reclassify",
                                    path: [newClassification.orgName].concat(newClassification.categories)
                                });
                            });
                        } else done();
                    })),
                    done => elastic.elasticsearch('form', query, settings, handleError({}, result => {
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, handleError({}, de => {
                                    classifyItem(de, newClassification.orgName, newClassification.categories);
                                    de.save(handleError({}, doneOne));
                                }));
                            }, () => {
                                done();
                                mongo_data.addToClassifAudit({
                                    date: new Date(),
                                    user: user,
                                    elements: tinyIds.map(function (e) {
                                        return {tinyId: e, eltType: "form"};
                                    }),
                                    action: "reclassify",
                                    path: [newClassification.orgName].concat(newClassification.categories)
                                });
                            });
                        } else done();
                    }))
                ], handleError({}, () => mongo_data.removeJobStatus("reclassifyClassification", callback)));
            });
        });
    });
}

export async function updateOrgClassification(orgName): Promise<any[]> {
    const aggregate = [
        {$match: {archived: false, 'classification.stewardOrg.name': orgName}},
        {$unwind: '$classification'},
        {$match: {archived: false, 'classification.stewardOrg.name': orgName}},
        {$group: {_id: '$classification.stewardOrg.name', elements: {$addToSet: "$classification"}}}
    ];
    const cdeClassifications: OrgClassification[] = await DataElement.aggregate(aggregate);
    const formClassifications: OrgClassification[] = await Form.aggregate(aggregate);
    return mergeOrgClassifications(cdeClassifications, formClassifications);
}
