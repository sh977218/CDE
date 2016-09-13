var fs = require('fs');
var async = require('async');

var MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
var MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;

var ult = require('./Shared/Ultility');
var orgInfoMapping = require('./Shared/ORG_INFO_MAP').map;
var classificationShared = require('../../modules/system/shared/classificationShared');

function doLoadCdeIntoMigrationByOrgName(org, orgInfo, next) {
    var orgName = orgInfo['orgName'];
    var stream = MigrationNCICdeXmlModel.find({xml: orgName}).stream();
    stream.on('data', function (xml) {
        stream.pause();
        xml = xml.toObject();
        var id = xml.PUBLICID[0];
        var version = xml.VERSION[0];
        var newCde = ult.createNewCde(xml, org, orgInfo);
        if (newCde) {
            MigrationDataElementModel.find({'ids.id': id}).elemMatch('ids', {
                "source": 'caDSR',
                "id": id
            }).exec(function (err, existingCdes) {
                if (err) throw err;
                if (existingCdes.length === 0) {
                    var obj = new MigrationDataElementModel(newCde);
                    obj.save(function (err) {
                        if (err) throw err;
                        stream.resume();
                    });
                } else if (existingCdes.length === 1) {
                    var existingCde = existingCdes[0];
                    classificationShared.transferClassifications(newCde, existingCde);
                    existingCde.markModified('classification');
                    existingCde.save(function (err) {
                        if (err) throw err;
                        stream.resume();
                    })
                } else {
                    console.log('find more than one existing Cde of id:' + id + ' version: ' + version);
                    process.exit(1);
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
        console.log('End of ' + orgName + ' stream.');
        org.markModified('classifications');
        org.save(function (e) {
            if (e) throw e;
            console.log('finished all xml for org: ' + orgName);
            next();
        });
    });
}


exports.loadNciCdesIntoMigrationByOrgName = function (orgName) {
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
                doLoadCdeIntoMigrationByOrgName(org, orgInfo, function () {
                    cb();
                })
            });
        }
    ], function (err) {
        if (err) throw err;
        process.exit(1);
    });
};
