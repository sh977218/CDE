var fs = require('fs');
var async = require('async');
var xml2js = require('xml2js');
var parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;
var MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;

var xmlFolder = 'S:/CDE/NCI/CDE XML/';
var xmlFileMapping = {
    'bpv.xml': 'NCI-BPV',
    'standard.xml': 'NCI',
    'gtex.xml': 'NCI-GTEx'
};


function run() {
    async.series([
        function (cb) {
            MigrationNCICdeXmlModel.remove({}, function (err) {
                if (err) throw err;
                console.log('MigrationNCICdeXmlModel removed');
                cb();
            });
        },
        function () {
            console.log('Reading xml files from ' + xmlFolder);
            fs.readdir(xmlFolder, function (error, files) {
                if (error) throw error;
                async.forEachSeries(files, function (xml, doneOneXml) {
                    var xmlFile = xmlFolder + xml;
                    fs.readFile(xmlFile, function (err, data) {
                        var counter = 0;
                        console.log('Start processing ' + xml);
                        if (err) throw err;
                        parseString(data, function (e, json) {
                            var index = 0;
                            async.forEachSeries(json.DataElementsList.DataElement, function (one, doneOne) {
                                one['xmlFile'] = xmlFile;
                                one['index'] = index;
                                one['xml'] = xmlFileMapping[xml];
                                index++;
                                var id = one.PUBLICID[0];
                                var version = one.VERSION[0];
                                MigrationNCICdeXmlModel.find({
                                    'PUBLICID': id,
                                    'VERSION': version,
                                    'xmlFileName': xml
                                }).exec(function (err, existingXmls) {
                                    if (err) throw err;
                                    else if (existingXmls.length === 0) {
                                        var obj = new MigrationNCICdeXmlModel(one);
                                        obj.save(function (err) {
                                            if (err) throw err;
                                            counter++;
                                            doneOne();
                                        })
                                    } else {
                                        console.log('find ' + existingXmls.length + ' xml with id: ' + id + ' version: ' + version);
                                        doneOne();
                                    }
                                });
                            }, function doneAll() {
                                console.log('Finished processing ' + xml);
                                console.log('counter: ' + counter);
                                doneOneXml();
                            })
                        })
                    });
                }, function doneAllXml() {
                    console.log('Finished loading all XML.');
                    process.exit(1);
                })
            })
        }
    ]);
}
run();