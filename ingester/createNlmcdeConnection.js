var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../modules/system/node-js/parseConfig');
var cde_schemas = require('../modules/cde/node-js/schemas');
var form_schemas = require('../modules/form/node-js/schemas');
var sharedSchemas = require('../modules/system/node-js/schemas.js');

var mongoUri = config.mongoUri;
var mongoConn = mongoose.createConnection(mongoUri);
mongoConn.once('open', function callback() {
    console.log('mongodb ' + config.database.appData.db + ' connection open');
});


// PRODUCTION
exports.DataElementModel = mongoConn.model('DataElement', new Schema(cde_schemas.deJson));
exports.FormModel = mongoConn.model('Form', new Schema(form_schemas.formJson));
exports.OrgModel = mongoConn.model('Org', new Schema(sharedSchemas.orgJson));