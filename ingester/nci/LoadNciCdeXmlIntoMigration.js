const fs = require('fs');
const async = require('async');
const xml2js = require('xml2js');
const parseString = new xml2js.Parser({attrkey: 'attribute'}).parseString;
const MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;

const xmlFolder = 'S:/MLB/CDE/NCI/CDE XML/';
const xmlFileMapping = {
    'bpv.xml': 'NCI-BPV',
    'standard.xml': 'NCI Preferred Standards',
    'gtex.xml': 'NCI-GTEx'
};


async function run() {
    await MigrationNCICdeXmlModel.remove({});
    console.log('MigrationNCICdeXmlModel removed');
    console.log('Reading xml files from ' + xmlFolder);

    fs.readdir(xmlFolder, function (error, files) {
        if (error) throw error;
        for (let xml of files) {
            let xmlFile = xmlFolder + xml;
            fs.readFile(xmlFile, function (err, data) {
                let counter = 0;
                console.log('Start processing ' + xml);
                if (err) throw err;
                parseString(data, function (e, json) {
                    let index = 0;
                    async.forEachSeries(json.DataElementsList.DataElement, async function (one, doneOne) {
                        one['xmlFile'] = xmlFile;
                        one['index'] = index;
                        one['xml'] = xmlFileMapping[xml];
                        index++;
                        let id = one.PUBLICID[0];
                        let version = one.VERSION[0];
                        let existingXmls = await MigrationNCICdeXmlModel.find({
                            'PUBLICID': id,
                            'VERSION': version,
                            'xmlFileName': xml
                        }).exec();
                        if (existingXmls.length === 0) {
                            new MigrationNCICdeXmlModel(one).save();
                            counter++;
                        } else {
                            console.log('find ' + existingXmls.length + ' xml with id: ' + id + ' version: ' + version);
                            doneOne();
                        }
                    }, function doneAll() {
                        console.log('Finished processing ' + xml);
                        console.log('counter: ' + counter);
                        doneOneXml();
                    })
                })
            });
        }
        console.log('Finished loading all XML.');
    })

}

run().then(() => {
}, err => console.log(err));