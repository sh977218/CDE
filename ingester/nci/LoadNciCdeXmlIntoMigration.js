var fs = require('fs'),
    async = require('async'),
    parseString = require('xml2js').parseString,
    MigrationNCICdeXmlModel = require('../createConnection').MigrationNCICdeXmlModel
    ;

var xmlFolder = 'S:/CDE/NCI/CDE XML/';

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
                async.forEach(files, function (xml, doneOneXml) {
                    fs.readFile(xmlFolder + xml, function (err, data) {
                        console.log('Start processing ' + xml);
                        if (err) throw err;
                        parseString(data, function (e, json) {
                            async.forEach(json.DataElementsList, function (one, doneOne) {
                                var obj = new MigrationNCICdeXmlModel(one);
                                obj.save(function () {
                                    doneOne();
                                })
                            }, function doneAll() {
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