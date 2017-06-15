/*
 This loader does NOT load questions in form or CDE.
 */
let async = require('async');

let MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
let MigrationForm = require('../createMigrationConnection').MigrationFormModel;
let MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
let ProtocolToForm = require('./Website/ProtocolToForm');

let count = 0;
let phenxOrg;

function run() {
    async.series([
        function (cb) {
            MigrationForm.remove({}, function (err) {
                if (err) throw err;
                console.log("Migration Form removed.");
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({name: 'PhenX'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    phenxOrg = org;
                    cb();
                } else {
                    new MigrationOrgModel({name: "PhenX", classification: []}).save(function (e, o) {
                        if (o) throw o;
                        else {
                            phenxOrg = org;
                            cb();
                        }
                    });
                }
            });
        },
        function (cb) {
            let stream = MigrationProtocolModel.find({}).stream();
            stream.on('data', function (protocol) {
                stream.pause();
                let formId = protocol.get('formId');
                MigrationForm.find({}).where("ids").elemMatch(function (elem) {
                    elem.where("source").equals("PhenX");
                    elem.where("id").equals(formId);
                }).exec(function (err, existingForms) {
                    if (err) throw err;
                    else if (existingForms.length === 0) {
                        let newForm = ProtocolToForm.createForm(protocol, phenxOrg);
                        new MigrationForm(newForm).save(function (err) {
                            if (err) throw err;
                            else {
                                count++;
                                console.log('count: ' + count);
                                stream.resume();
                            }
                        });
                    } else {
                        console.log(existingForms.length + ' forms found, formId: ' + protocol.formId);
                        process.exit(1);
                    }
                });
            });
            stream.on('end', function (err) {
                if (err) throw err;
                if (cb) cb();
            });
        },
        function (cb) {
            phenxOrg.save(e => {
                if (e)throw e;
                else cb();
            });
        }
    ], function () {
        console.log('Finished.');
        process.exit(0);
    });
}

run();