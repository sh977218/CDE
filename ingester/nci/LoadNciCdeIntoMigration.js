var fs = require('fs');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var parseString = new xml2js.Parser({attrkey: 'attribute', explicitArray: false}).parseString;

var MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
var MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;

var ult = require('./Shared/utility');
var orgInfoMapping = require('./Shared/ORG_INFO_MAP').map;
var classificationShared = require('../../modules/system/shared/classificationShared');

var cdeCount = 0;

function doLoadCdeIntoMigrationByOrgName(org, orgInfo, next) {
    var orgName = orgInfo.orgName;
    var stream = MigrationNCICdeXmlModel.find({xml: orgName}).stream();
    stream.on('data', function (xml) {
        stream.pause();
        xml = xml.toObject();
        var id = xml.PUBLICID[0];
        var version = xml.VERSION[0];
        var options = {
            method: 'GET',
            url: 'http://cadsrapi.nci.nih.gov/cadsrapi41/GetXML',
            qs: {query: 'DataElement[@publicId=' + id + '][@version=' + version + ']'},
            headers: {
                'postman-token': '9a604217-1ebc-c0f9-9fd3-cee7fa8d6b01',
                'cache-control': 'no-cache',
                authorization: 'Basic bHVkZXRjOmxvdmVsb2luYw==',
                cookie: '__utma=126996496.619030126.1470687670.1470763153.1471621886.2; __utmc=126996496; __utmz=126996496.1470763153.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _gat=1; _ga=GA1.2.619030126.1470687670'
            }
        };
        request(options, function (error, response, body) {
            if (error) throw error;
            parseString(body, function (e, json) {
                if (e) throw e;
                var recordCounterArray = json['xlink:httpQuery']['queryResponse']['recordCounter'];
                if (recordCounterArray) {
                    recordCounterArray.forEach(function (recordCounter) {
                        if (recordCounter !== "1") {
                            process.exit(1);
                        }
                    });
                    var fields = json['xlink:httpQuery']['queryResponse']['class']['field'];
                    var source = {sourceName: 'caDSR'};
                    fields.forEach(function (field) {
                        if (field.attribute.name == 'dateCreated') {
                            source['created'] = field._;
                        }
                        if (field.attribute.name == 'dateModified') {
                            source['updated'] = field._;
                        }
                    });
                    var newCde = ult.createNewCde(xml, org, orgInfo, source);
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
                                    cdeCount++;
                                    console.log("cdeCount:" + cdeCount);
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
                }
            });
        });
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


exports.loadNciCdesIntoMigrationByOrgNames = function (orgNames) {
    var orgInfos = [];
    orgNames.forEach(function (orgName) {
        orgInfos.push(orgInfoMapping[orgName]);
    });
    var orgName = orgInfos[0].stewardOrgName;
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
            new MigrationOrgModel({name: 'NCI'}).save(function (createOrgError, org) {
                if (createOrgError) throw createOrgError;
                console.log('Created new org of ' + orgName + ' in migration db');
                async.forEachSeries(orgInfos, function (orgInfo, doneOneOrgInfo) {
                    doLoadCdeIntoMigrationByOrgName(org, orgInfo, function () {
                        doneOneOrgInfo();
                    })
                }, function doneAllOrgInfos() {
                    cb();
                })
            });
        }
    ], function (err) {
        if (err) throw err;
        process.exit(1);
    });
};
