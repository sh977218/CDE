let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let config = require('../server/system/parseConfig');
let cde_schemas = require('../server/cde/schemas');
let form_schemas = require('../server/form/schemas');
let sharedSchemas = require('../server/system/schemas.js');

let migrationConn = mongoose.createConnection(config.database.migration.uri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});

// LOINC
exports.MigrationLoincModel = migrationConn.model('MigrationLoinc', new Schema({}, {
    strict: false,
    collection: 'loinc',
    usePushEach: true
}));
exports.MigrationLoincClassificationMappingModel = migrationConn.model('MigrationLoincClassificationMapping', new Schema({}, {
    strict: false,
    collection: 'LoincClassificationMapping',
    usePushEach: true
}));
exports.MigrationLoincScaleMappingModel = migrationConn.model('MigrationLoincScaleMapping', new Schema({}, {
    strict: false,
    collection: 'LoincScaleMapping',
    usePushEach: true
}));


// NINDS
exports.MigrationNindsModel = migrationConn.model('MigrationNINDS', new Schema({}, {
    strict: false,
    collection: 'ninds',
    usePushEach: true
}));
exports.NindsCdeModel = migrationConn.model('nindsCde', new Schema({}, {
    strict: false,
    collection: 'nindsCdes',
    usePushEach: true
}));
exports.NindsFormModel = migrationConn.model('nindsForm', new Schema({}, {
    strict: false,
    collection: 'nindsForms',
    usePushEach: true
}));

// NCI
exports.MigrationNCIFormXmlModel = migrationConn.model('MigrationNCIFormXml', new Schema({}, {
    strict: false,
    collection: 'nciFormXml',
    usePushEach: true
}));
exports.MigrationNCICdeXmlModel = migrationConn.model('MigrationNCICdeXml', new Schema({}, {
    strict: false,
    collection: 'nciCdeXml',
    usePushEach: true
}));

// EYE GENE
exports.MigrationEyeGENELoincModel = migrationConn.model('EyeGENE_LOINC', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_LOINC',
    usePushEach: true
}));
exports.MigrationEyeGENEAnswerListModel = migrationConn.model('EyeGENE_AnswerList', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_AnswerList',
    usePushEach: true
}));

//NEW BORN SCREENING
exports.MigrationNewbornScreeningCDEModel = migrationConn.model('NewbornScreening_CDE', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_CDE',
    usePushEach: true
}));
exports.MigrationNewBornScreeningFormModel = migrationConn.model('NewbornScreening_Form', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_Form',
    usePushEach: true
}));
exports.MigrationNewBornScreeningAnswerListModel = migrationConn.model('NewbornScreening_AnswerList', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_AnswerList',
    usePushEach: true
}));

// MIGRATION
exports.MigrationDataElementModel = migrationConn.model('MigrationDataElement', new Schema(cde_schemas.deJson, {
    collection: 'dataelements',
    usePushEach: true
}));
exports.MigrationFormModel = migrationConn.model('MigrationForm', new Schema(form_schemas.formJson, {
    collection: 'forms',
    usePushEach: true
}));
exports.MigrationOrgModel = migrationConn.model('MigrationOrg', new Schema(sharedSchemas.orgJson, {
    collection: 'orgs',
    usePushEach: true
}));

// PHENX
exports.MeasureModel = migrationConn.model('Measure', new Schema({}, {
    strict: false,
    collection: 'Measure',
    usePushEach: true
}));
exports.ProtocolModel = migrationConn.model('Protocol', new Schema({}, {
    strict: false,
    collection: 'Protocol',
    usePushEach: true
}));
exports.MigrationCacheModel = migrationConn.model('MigrationCache', new Schema({}, {
    strict: false,
    collection: 'Cache',
    usePushEach: true
}));
exports.MigrationPhenxRedcapModel = migrationConn.model('MigrationPhenxRedcapModel', new Schema({}, {
    strict: false,
    collection: 'PhenxRedcap',
    usePushEach: true
}));
exports.MigrationRedcapModel = migrationConn.model('MigrationRedcapModel', new Schema({}, {
    strict: false,
    collection: 'Redcap',
    usePushEach: true
}));
exports.PhenxURL = "https://original-phenxtoolkit.rti.org/index.php?pageLink=browse.measures&tree=off";
exports.PHENX_ZIP_BASE_FOLDER = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/all';


// MIGRATION REFERENCE COLLECTION
exports.MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping',
    usePushEach: true
}));
exports.MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new Schema({}, {
    strict: false,
    collection: 'VariableCrossReference',
    usePushEach: true
}));
