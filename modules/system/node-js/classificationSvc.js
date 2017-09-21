const async = require('async');
const mongo_cde = require('../../cde/node-js/mongo-cde');
const mongo_form = require('../../form/node-js/mongo-form');
const mongo_data = require('./mongo-data');
const classificationShared = require('../shared/classificationShared');

exports.deleteOrgClassification = (orgName, categories, callback) => {
    if (!(categories instanceof Array)) categories = [categories];
    mongo_data.updateJobStatus("deleteClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications};
            classificationShared.deleteCategory(fakeTree, categories);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                let query = {"classification.stewardOrg.name": orgName, archived: false};
                categories.forEach((category, i) => {
                    let key = "classification";
                    for (let j = 0; j <= i; j++)
                        key += ".elements";
                    key += ".name";
                    query[key] = category;
                });
                async.forEach([mongo_cde.DataElement, mongo_form.Form], (collection, doneOneCollection) => {
                    collection.find(query).cursor().eachAsync(elt => {
                        let steward = classificationShared.findSteward(elt, orgName);
                        classificationShared.deleteCategory(steward.object, categories);
                        return elt.save();
                    }).then(() => {
                        doneOneCollection();
                    });
                }, () => mongo_data.removeJobStatus("deleteClassification", callback));
            });
        });
    });
};

exports.renameOrgClassification = (orgName, categories, newName, callback) => {
    if (!(categories instanceof Array)) categories = [categories];
    mongo_data.updateJobStatus("renameClassification", "Running", err => {
        if (err) return callback(err);
        mongo_data.orgByName(orgName, (err, stewardOrg) => {
            if (err) return callback(err, stewardOrg);
            let fakeTree = {elements: stewardOrg.classifications};
            classificationShared.renameCategory(fakeTree, categories, newName);
            stewardOrg.markModified("classifications");
            stewardOrg.save(err => {
                if (err) return callback(err, stewardOrg);
                let query = {"classification.stewardOrg.name": orgName, archived: false};
                categories.forEach((category, i) => {
                    let key = "classification";
                    for (let j = 0; j <= i; j++)
                        key += ".elements";
                    key += ".name";
                    query[key] = category;
                });
                async.forEach([mongo_cde.DataElement, mongo_form.Form], (collection, doneOneCollection) => {
                    collection.find(query).cursor().eachAsync(elt => {
                        let steward = classificationShared.findSteward(elt, orgName);
                        classificationShared.renameCategory(steward.object, categories, newName);
                        return elt.save();
                    }).then(() => {
                        doneOneCollection();
                    });
                }, () => mongo_data.removeJobStatus("renameClassification", callback));
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

exports.reclassifyOrgClassification = (oldClassification, newClassification, query, callback) => {
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
                let query = {"classification.stewardOrg.name": oldClassification.orgName, archived: false};
                oldClassification.categories.forEach((category, i) => {
                    let key = "classification";
                    for (let j = 0; j <= i; j++)
                        key += ".elements";
                    key += ".name";
                    query[key] = category;
                });
                async.forEach([mongo_cde.DataElement, mongo_form.Form], (collection, doneOneCollection) => {
                    collection.find(query).cursor().eachAsync(elt => {
                        classificationShared.classifyItem(elt, newClassification.orgName, newClassification.categories);
                        return elt.save();
                    }).then(() => {
                        doneOneCollection();
                    });
                }, () => mongo_data.removeJobStatus("reclassifyClassification", callback));
            });
        });
    });
};
