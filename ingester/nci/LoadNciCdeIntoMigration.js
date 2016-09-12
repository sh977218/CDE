var fs = require('fs');
var async = require('async');

var MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
var MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;

var ult = require('./Shared/Ultility');
var orgInfoMapping = require('./Shared/ORG_INFO_MAP').map;

function run(orgName) {
    var nciOrg;
    var orgInfo = orgInfoMapping[orgName];
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                console.log('Removed all doc in migration dataelements collection');
                if (err) throw err;
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (removeOrgError) {
                if (removeOrgError) throw removeOrgError;
                console.log('Removed all doc in migration orgs collection');
                cb();
            });
        },
        function (cb) {
            new MigrationOrgModel({name: orgName}).save(function (createOrgError, org) {
                if (createOrgError) throw createOrgError;
                console.log('Created new org of ' + orgName + ' in migration db');
                nciOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = MigrationNCICdeXmlModel.find({xml: orgName}).stream();
            stream.on('data', function (xml) {
                stream.pause();
                xml = xml.toObject();
                var newCde = ult.createNewCde(xml, orgInfo);
                if (newCde) {
                    MigrationDataElementModel.find({
                        'registrationState.registrationStatus': newCde.registrationState.registrationStatus,
                        'ids.id': newCde.ids[0].id
                    }).elemMatch('ids', {
                        "source": newCde.ids[0].source,
                        "id": newCde.ids[0].id,
                        "version": newCde.ids[0].version
                    }).exec(function (err, existingCdes) {
                        if (err) throw err;
                        if (existingCdes.length === 0) {
                            var obj = new MigrationDataElementModel(newCde);
                            obj.save(function (err, o) {
                                if (err) {
                                    throw err;
                                    process.exit(1);
                                } else if (o) {
                                    stream.resume();
                                } else {
                                    process.exit(1);
                                }
                            });
                        } else {
                            console.log('find 1 existing Cde of id:' + newCde.ids[0].id + ' version: ' + newCde.ids[0].version);
                            stream.resume();
                        }
                    })
                } else {
                    stream.resume();
                }
            });
            stream.on('error', function (err) {
                if (err) throw err;
                process.exit(1);
            });
            stream.on('close', function () {
                console.log("End of NCI stream.");
                nciOrg.markModified('classifications');
                nciOrg.save(function (e) {
                    if (e) throw e;
                    console.log('finished all xml');
                    if (cb) cb();
                    else process.exit(0);
                });
            });
        }
    ], function (err) {
        if (err) throw err;
        process.exit(1);
    });
}


run('NCI');