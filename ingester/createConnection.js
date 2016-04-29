var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
    sharedSchemas = require('../modules/system/node-js/schemas.js')
    ;


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


exports.MigrationNindsModel = migrationConn.model('MigrationNINDS', new mongoose.Schema({}, {
    strict: false,
    collection: 'ninds'
}));
exports.MigrationEyeGeneLoincModel = migrationConn.model('EyeGENE_LOINC', new mongoose.Schema({}, {
    strict: false,
    collection: 'EyeGENE_LOINC'
}));
exports.MigrationEyeGeneAnswerListModel = migrationConn.model('EyeGENE_AnswerList', new mongoose.Schema({}, {
    strict: false,
    collection: 'EyeGENE_AnswerList'
}));

exports.MigrationDataElementModel = migrationConn.model('MigrationDataElement', cde_schemas.dataElementSchema);
exports.MigrationFormModel = migrationConn.model('MigrationForm', form_schemas.formSchema);
exports.MigrationOrgModel = migrationConn.model('MigrationOrg', sharedSchemas.orgSchema);
exports.MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new mongoose.Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping'
}));
exports.MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new mongoose.Schema({}, {
    strict: false,
    collection: 'VariableCrossReference'
}));

exports.DataElementModel = mongoConn.model('DataElement', cde_schemas.dataElementSchema);
exports.FormModel = mongoConn.model('Form', form_schemas.formSchema);
exports.BoardModel = mongoConn.model('Board', cde_schemas.pinningBoardSchema);