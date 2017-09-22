const async = require('async');
const mongo_cde = require('../../cde/node-js/mongo-cde');
const mongo_form = require('../../form/node-js/mongo-form');
const mongo_data = require('./mongo-data');
const classificationShared = require('../shared/classificationShared');
const elastic = require('./elastic');
const logger = require('./logging.js').MongoLogger;

exports.deleteOrgClassification = (user, deleteClassification, settings, callback) => {
    if (!(deleteClassification.categories instanceof Array))
        deleteClassification.categories = [deleteClassification.categories];
    mongo_data.updateJobStatus("deleteClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(deleteClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications};
            classificationShared.deleteCategory(fakeTree, deleteClassification.categories);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = deleteClassification.orgName;
                settings.selectedElements = deleteClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch(query, "cde", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, (err, de) => {
                                    if (err) logger.log(err);
                                    classificationShared.unclassifyElt(de, deleteClassification.orgName, deleteClassification.categories);
                                    de.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    }),
                    done => elastic.elasticsearch(query, "form", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.forms.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, (err, form) => {
                                    if (err) logger.log(err);
                                    classificationShared.unclassifyElt(form, deleteClassification.orgName, deleteClassification.categories);
                                    form.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    })
                ], err => {
                    if (err) logger.log(err);
                    mongo_data.removeJobStatus("deleteClassification", callback);
                });
            });
        });
    });
};

exports.renameOrgClassification = (user, newClassification, settings, callback) => {
    if (!(newClassification.categories instanceof Array))
        newClassification.categories = [newClassification.categories];
    mongo_data.updateJobStatus("renameClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications};
            classificationShared.renameCategory(fakeTree, newClassification.categories, newClassification.newName);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = newClassification.orgName;
                settings.selectedElements = newClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch(query, "cde", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, (err, de) => {
                                    if (err) logger.log(err);
                                    classificationShared.renameClassifyElt(de, newClassification.orgName, newClassification.categories, newClassification.newName);
                                    de.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    }),
                    done => elastic.elasticsearch(query, "form", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.forms.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, (err, form) => {
                                    if (err) logger.log(err);
                                    classificationShared.renameClassifyElt(form, newClassification.orgName, newClassification.categories, newClassification.newName);
                                    form.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    })
                ], err => {
                    if (err) logger.log(err);
                    mongo_data.removeJobStatus("renameClassification", callback);
                });
            });
        });
    });
};

exports.addOrgClassification = (orgName, categories, callback) => {
    if (!(categories instanceof Array)) categories = [categories];
    mongo_data.orgByName(orgName, (err, stewardOrg) => {
        if (err) return callback(err, stewardOrg);
        let fakeTree = {elements: stewardOrg.classifications};
        let exist = classificationShared.addCategory(fakeTree, categories);
        if (exist) return callback(exist);
        stewardOrg.markModified("classifications");
        stewardOrg.save(callback);
    });
};

exports.reclassifyOrgClassification = (user, oldClassification, newClassification, settings, callback) => {
    if (!(oldClassification.categories instanceof Array)) oldClassification.categories = [oldClassification.categories];
    if (!(newClassification.categories instanceof Array)) newClassification.categories = [newClassification.categories];
    mongo_data.updateJobStatus("reclassifyClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(newClassification.orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications};
            classificationShared.addCategory(fakeTree, newClassification.categories);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                settings.selectedOrg = oldClassification.orgName;
                settings.selectedElements = oldClassification.categories;
                let query = elastic.buildElasticSearchQuery(user, settings);
                async.parallel([
                    done => elastic.elasticsearch(query, "cde", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.cdes && result.cdes.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_cde.byTinyId(tinyId, (err, de) => {
                                    if (err) logger.log(err);
                                    classificationShared.classifyElt(de, newClassification.orgName, newClassification.categories);
                                    de.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    }),
                    done => elastic.elasticsearch(query, "form", function (err, result) {
                        if (err) logger.log(err);
                        if (result && result.forms && result.forms.length > 0) {
                            let tinyIds = result.cdes.map(c => c.tinyId);
                            async.forEach(tinyIds, (tinyId, doneOne) => {
                                mongo_form.byTinyId(tinyId, (err, de) => {
                                    if (err) logger.log(err);
                                    classificationShared.classifyElt(de, newClassification.orgName, newClassification.categories);
                                    de.save(err => {
                                        if (err) logger.log(err);
                                        doneOne();
                                    });
                                });
                            }, () => done());
                        } else done();
                    })
                ], err => {
                    if (err) logger.log(err);
                    mongo_data.removeJobStatus("reclassifyClassification", callback);
                });
            });
        });
    });
};
