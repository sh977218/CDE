var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var mongo_form = require('../../modules/form/node-js/mongo-form');
var mongo_data = require('../../modules/system/node-js/mongo-data');

var wrongOrgName = 'EyeGene';
var orgName = 'eyeGENE';

async.series([
    function (cb) {
        mongo_data.Org.find({name: wrongOrgName}).exec(function (err, orgs) {
            if (err) throw err;
            async.forEach(orgs, function (org, doneOneOrg) {
                org.name = orgName;
                org.save(function (err) {
                    if (err) throw err;
                    doneOneOrg();
                });
            }, function doneAllUsers() {
                console.log('Fixed org');
                cb();
            });
        });
    },
    function (cb) {
        mongo_cde.User.find({orgAdmin: wrongOrgName}).exec(function (err, users) {
            if (err) throw err;
            async.forEach(users, function (user, doneOneUser) {
                user.orgAdmin.forEach(function (oa, i) {
                    if (oa === wrongOrgName) {
                        user.orgAdmin[i] = orgName;
                    }
                });
                user.markModified("orgAdmin");
                user.save(function (err) {
                    if (err) throw err;
                    doneOneUser();
                });
            }, function doneAllUsers() {
                console.log('Fixed user orgAdmin');
                cb();
            });
        });
    },
    function (cb) {
        mongo_cde.User.find({orgCurator: wrongOrgName}).exec(function (err, users) {
            if (err) throw err;
            async.forEach(users, function (user, doneOneUser) {
                user.orgCurator.forEach(function (oa, i) {
                    if (oa === wrongOrgName) {
                        user.orgCurator[i] = orgName;
                    }
                });
                user.markModified("orgCurator");
                user.save(function (err) {
                    if (err) throw err;
                    doneOneUser();
                });
            }, function doneAllUsers() {
                console.log('Fixed user orgCurator');
                cb();
            });
        });
    },
    function (cb) {
        var deCount = 0;
        var stream = mongo_cde.getStream({
            'classification.stewardOrg.name': wrongOrgName
        });
        stream.on('data', function (doc) {
            stream.pause();
            doc.classification.forEach(function (c) {
                if (c.stewardOrg.name === wrongOrgName)
                    c.stewardOrg.name = orgName;
            });
            if (doc.valueDomain.datatype === 'Value List') {
                doc.valueDomain.permissibleValues.forEach(function (pv) {
                    pv.codeSystemName = 'LOINC';
                });
            }
            doc.save(function (err) {
                if (err) throw err;
                else {
                    deCount++;
                    console.log('deCount:' + deCount);
                    stream.resume();
                }
            });
        });
        stream.on('error', function (err) {
            throw err;
        });
        stream.on('end', function () {
            console.log('Fixed CDE classification and permissible value');
            cb();
        });
    }, function (cb) {
        var formCount = 0;
        var stream = mongo_form.getStream({
            'classification.stewardOrg.name': wrongOrgName
        });
        stream.on('data', function (doc) {
            stream.pause();
            doc.classification.forEach(function (c) {
                if (c.stewardOrg.name === wrongOrgName)
                    c.stewardOrg.name = orgName;
            });
            doc.save(function (err) {
                if (err) throw err;
                else {
                    formCount++;
                    console.log('formCount:' + formCount);
                    stream.resume();
                }
            });
        });
        stream.on('error', function (err) {
            throw err;
        });
        stream.on('end', function () {
            console.log('Fixed form classification');
            cb();
        });
    }
], function () {
    console.log('Finished');
    process.exit(1);
});