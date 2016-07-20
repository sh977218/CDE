var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
    sharedSchemas = require('../modules/system/node-js/schemas.js'),
    Schema = mongoose.Schema,
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../modules/form/node-js/mongo-form'),
    mongo_data = require('../modules/system/node-js/mongo-data')
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

exports.MigrationLoincModal = migrationConn.model('MigrationLoinc', new mongoose.Schema({}, {
    strict: false,
    collection: 'loinc'
}));
exports.MigrationNindsModel = migrationConn.model('MigrationNINDS', new mongoose.Schema({}, {
    strict: false,
    collection: 'ninds'
}));
exports.MigrationNCIFormXmlModel = migrationConn.model('MigrationNCIFormXml', new mongoose.Schema({}, {
    strict: false,
    collection: 'nciFormXml'
}));
exports.MigrationNCICdeXmlModel = migrationConn.model('MigrationNCICdeXml', new mongoose.Schema({}, {
    strict: false,
    collection: 'nciCdeXml'
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
exports.MigrationFormModel = migrationConn.model('MigrationForm', new Schema(form_schemas.formJson));
exports.MigrationOrgModel = migrationConn.model('MigrationOrg', sharedSchemas.orgSchema);
exports.MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new mongoose.Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping'
}));
exports.MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new mongoose.Schema({}, {
    strict: false,
    collection: 'VariableCrossReference'
}));

exports.DataElementModel = mongo_cde.DataElement;
exports.FormModel = mongo_form.Form;
exports.BoardModel = mongo_cde.PinningBoard;
exports.OrgModel = mongo_data.Org;
