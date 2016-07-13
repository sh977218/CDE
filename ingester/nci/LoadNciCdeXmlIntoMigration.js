var fs = require('fs'),
    async = require('async'),
    xml2js = require('xml2js'),
    parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString,
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
                async.forEachSeries(files, function (xml, doneOneXml) {
                    var xmlFile = xmlFolder + xml;
                    fs.readFile(xmlFile, function (err, data) {
                        var counter = 0;
                        console.log('Start processing ' + xml);
                        if (err) throw err;
                        parseString(data, function (e, json) {
                            var index = 0;
                            async.forEach(json.DataElementsList.DataElement, function (one, doneOne) {
                                one['xmlFile'] = xmlFile;
                                one['index'] = index;
                                index++;
                                var obj = new MigrationNCICdeXmlModel(one);
                                obj.save(function (err) {
                                    if (err) throw err;
                                    counter++;
                                    doneOne();
                                })
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