const request = require('request');
const url = require('url');
const parseString = require('xml2js').parseString;
const MigrationNCIModel = require('../createMigrationConnection').MigrationNCIFormXmlModel;

let jSessionId = '';

exports.setJSessionId = function (id) {
    jSessionId = id;
};

function doNCI(href, cb) {
    return new Promise((resolve, reject) => {
        if (jSessionId.length === 0) reject('no jSessionId set');
        let parsedUrl = url.parse(href, true, true);
        let options = {
            method: 'GET',
            rejectUnauthorized: false,
            url: 'https://formbuilder.nci.nih.gov/FormBuilder/formXMLDownload.do',
            qs: {'': '', formIdSeq: parsedUrl.query.formIdSeq},
            headers: {
                'Cookie': 'JSESSIONID=' + jSessionId
            }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            parseString(body, async function (err, result) {
                result.form.href = href;
                let obj = await MigrationNCIModel(result).save();
                resolve(obj);
            });
        });
    })
}

exports.runArray = function (nciUrlArray) {
    return new Promise(async (resolve, reject) => {
        await MigrationNCIModel.remove({});
        console.log('removed migration nci collection.');

        for (let nciUrl of nciUrlArray) {
            await doNCI(nciUrl);
        }
        resolve();
    });
};

