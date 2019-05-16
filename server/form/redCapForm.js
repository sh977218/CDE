const _ = require('lodash');
const archiver = require('archiver');
const Json2csvParser = require('json2csv').parse;
const config = require('../system/parseConfig');
const field_type_map = {
    'Text': 'text',
    'Value List': 'radio',
    'Number': 'text',
    'Date': 'text'
};
const text_validation_type_map = {
    'Text': '',
    'Value List': '',
    'Number': 'number',
    'Date': 'date'
};

let existingVariables = {};
let label_variables_map = {};



exports.getZipRedCap = function (form, res) {
    switch (config.provider.faas) {
        case 'AWS':
            const AWS = require('aws-sdk');
            if (!global.CURRENT_SERVER_ENV) {
                throw new Error('ENV not ready');
            }
            let jsonPayload = {
                input: form
            };
            let params = {
                FunctionName: config.cloudFunction.zipExport.name + '-' + global.CURRENT_SERVER_ENV,
                Payload: JSON.stringify(jsonPayload)
            };

            new AWS.Lambda({region: 'us-east-1'}).invoke(params, (err, result) => {
                res.send(result);
            });
            break;
        case 'ON_PREM':
            exports.getOnPremZipRedCap(form, res);
            break;
        default:
            throw new Error('not supported');
    }
};

exports.getOnPremZipRedCap = function (form, res) {
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=' + form.designations[0].designation + '.zip'
    });

    let instrumentResult = getRedCap(form);
    let zip = archiver('zip', {});
    let hasError = false;
    zip.on('error', err => res.status(500).send({error: err.message}));

    //on stream closed we can end the request
    zip.on('end', function () {
    });
    if (!hasError) {
        zip.pipe(res);
        zip.append('NLM', {name: 'AuthorID.txt'})
            .append(form.tinyId, {name: 'InstrumentID.txt'})
            .append(instrumentResult, {name: 'instrument.csv'})
            .finalize();
    }
};

