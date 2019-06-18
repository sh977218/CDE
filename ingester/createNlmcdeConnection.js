var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../server/system/parseConfig');
var cde_schemas = require('../server/cde/schemas');
var form_schemas = require('../server/form/schemas');
var sharedSchemas = require('../server/system/schemas.js');

var mongoUri = config.mongoUri;
var mongoConn = mongoose.createConnection(mongoUri);
mongoConn.once('open', function callback() {
    console.log('mongodb ' + config.database.appData.db + ' connection open');
});


// PRODUCTION
exports.DataElementModel = mongoConn.model('DataElement', new Schema(cde_schemas.deJson));
exports.FormModel = mongoConn.model('Form', new Schema(form_schemas.formJson));
exports.OrgModel = mongoConn.model('Org', new Schema(sharedSchemas.orgJson));