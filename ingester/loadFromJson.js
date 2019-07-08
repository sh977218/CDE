import { config } from '../server/system/parseConfig';

// simple script to load forms or CDEs

var mongoose = require('mongoose'),
    schemas = require('../server/system/schemas'),
    cde_schemas = require('../server/cde/schemas'),
    form_schemas = require('../server/form/schemas'),
    fs = require('fs'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var Form = conn.model('Form', form_schemas.formSchema);

var file = process.argv[process.argv.length - 1];
var jsonObjs = JSON.parse(fs.readFileSync(file, 'utf8'));

if (process.argv.indexOf("--forms") > 0) {
    console.log("loading forms");
    async.each(jsonObjs, function (form, oneDone) {
        Form(form).save(oneDone);
    }, function (err) {
        if (err) console.log(err);
        process.exit(0);
    })
} else if (process.argv.indexOf("--cdes") > 0) {
    console.log("loading CDEs");
    async.each(jsonObjs, function (cde, oneDone) {
        DataElement(cde).save(oneDone);
    }, function (err) {
        if (err) console.log(err);
        process.exit(0);
    })
}