var mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    form_schemas = require('../../modules/form/node-js/schemas');


var mongoMigrationUri = config.mongoMigrationUri;
var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});


var mongoUri = config.mongoUri;
var mongoConn = mongoose.createConnection(mongoUri);
mongoConn.once('open', function callback() {
    console.log('mongodb ' + config.database.appData.db + ' connection open');
});


exports.NindsModel = migrationConn.model('NINDS', new mongoose.Schema({}, {
    strict: false,
    collection: 'ninds'
}));
exports.DataElementModel = migrationConn.model('DataElement', cde_schemas.dataElementSchema);
exports.FormModel = migrationConn.model('Form', form_schemas.formSchema);
