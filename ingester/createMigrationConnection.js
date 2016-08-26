var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
    sharedSchemas = require('../modules/system/node-js/schemas.js'),
    Schema = mongoose.Schema
    ;


var mongoMigrationUri = config.mongoMigrationUri;
var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});

// LOINC
exports.MigrationLoincModel = migrationConn.model('MigrationLoinc', new Schema({}, {
    strict: false,
    collection: 'loinc'
}));
exports.MigrationLoincClassificationMappingModel = migrationConn.model('MigrationLoincClassificationMapping', new Schema({}, {
    strict: false,
    collection: 'LoincClassificationMapping'
}));
exports.MigrationLoincScaleMappingModel = migrationConn.model('MigrationLoincScaleMapping', new Schema({}, {
    strict: false,
    collection: 'LoincScaleMapping'
}));


// NINDS
exports.MigrationNindsModel = migrationConn.model('MigrationNINDS', new Schema({}, {
    strict: false,
    collection: 'ninds'
}));

// NCI
exports.MigrationNCIFormXmlModel = migrationConn.model('MigrationNCIFormXml', new Schema({}, {
    strict: false,
    collection: 'nciFormXml'
}));
exports.MigrationNCICdeXmlModel = migrationConn.model('MigrationNCICdeXml', new Schema({}, {
    strict: false,
    collection: 'nciCdeXml'
}));

// EYE GENE
exports.MigrationEyeGeneLoincModel = migrationConn.model('EyeGENE_LOINC', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_LOINC'
}));
exports.MigrationEyeGeneAnswerListModel = migrationConn.model('EyeGENE_AnswerList', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_AnswerList'
}));

//NEW BORN SCREENING
exports.MigrationNewbornScreeningCDEModel = migrationConn.model('NewbornScreening_CDE', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_CDE'
}));
exports.MigrationNewBornScreeningFormModel = migrationConn.model('NewbornScreening_Form', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_Form'
}));
exports.MigrationNewBornScreeningAnswerListModel = migrationConn.model('NewbornScreening_AnswerList', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_AnswerList'
}));

// MIGRATION
exports.MigrationDataElementModel = migrationConn.model('MigrationDataElement', cde_schemas.dataElementSchema);
exports.MigrationFormModel = migrationConn.model('MigrationForm', new Schema(form_schemas.formJson));
exports.MigrationOrgModel = migrationConn.model('MigrationOrg', sharedSchemas.orgSchema);

// MIGRATION REFERENCE COLLECTION
exports.MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping'
}));
exports.MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new Schema({}, {
    strict: false,
    collection: 'VariableCrossReference'
}));
