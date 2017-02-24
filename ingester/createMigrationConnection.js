var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('../modules/system/node-js/parseConfig');
var cde_schemas = require('../modules/cde/node-js/schemas');
var form_schemas = require('../modules/form/node-js/schemas');
var sharedSchemas = require('../modules/system/node-js/schemas.js');

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
exports.MigrationEyeGENELoincModel = migrationConn.model('EyeGENE_LOINC', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_LOINC'
}));
exports.MigrationEyeGENEAnswerListModel = migrationConn.model('EyeGENE_AnswerList', new Schema({}, {
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
exports.MigrationDataElementModel = migrationConn.model('MigrationDataElement', new Schema(cde_schemas.deJson, {
    collection: 'dataelements'
}));
exports.MigrationFormModel = migrationConn.model('MigrationForm', new Schema(form_schemas.formJson, {
    collection: 'forms'
}));
exports.MigrationOrgModel = migrationConn.model('MigrationOrg', new Schema(sharedSchemas.orgJson, {
    collection: 'orgs'
}));

// PHENX
exports.MigrationMeasureModel = migrationConn.model('MigrationMeasure', new Schema({}, {
    strict: false,
    collection: 'Measure'
}));
exports.MigrationProtocolModel = migrationConn.model('MigrationProtocol', new Schema({}, {
    strict: false,
    collection: 'Protocol'
}));
exports.MigrationCacheModel = migrationConn.model('MigrationCache', new Schema({}, {
    strict: false,
    collection: 'Cache'
}));
exports.MigrationPhenxRedcapModel = migrationConn.model('MigrationPhenxRedcapModel', new Schema({}, {
    strict: false,
    collection: 'PhenxRedcap'
}));
exports.MigrationRedcapModel = migrationConn.model('MigrationRedcapModel', new Schema({}, {
    strict: false,
    collection: 'Redcap'
}));
exports.PhenxURL = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
exports.PHENX_ZIP_BASE_FOLDER = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/all';

// MIGRATION REFERENCE COLLECTION
exports.MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping'
}));
exports.MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new Schema({}, {
    strict: false,
    collection: 'VariableCrossReference'
}));
