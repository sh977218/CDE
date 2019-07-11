import { createConnection, Schema } from 'mongoose';
import { deJson } from 'server/cde/schemas';
import { formJson } from 'server/form/schemas';
import { config } from 'server/system/parseConfig';
import { orgJson } from 'server/system/schemas';

let migrationConfig = config.database.migration;

let migrationConn = createConnection(migrationConfig.uri, migrationConfig.options);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + migrationConfig.db + ' connection open');
});

// LOINC
export const MigrationLoincModel = migrationConn.model('MigrationLoinc', new Schema({}, {
    strict: false,
    collection: 'loinc',
    usePushEach: true
}));
export const MigrationLoincClassificationMappingModel = migrationConn.model('MigrationLoincClassificationMapping', new Schema({}, {
    strict: false,
    collection: 'LoincClassificationMapping',
    usePushEach: true
}));
export const MigrationLoincScaleMappingModel = migrationConn.model('MigrationLoincScaleMapping', new Schema({}, {
    strict: false,
    collection: 'LoincScaleMapping',
    usePushEach: true
}));


// NINDS
export const NindsModel = migrationConn.model('NINDS', new Schema({}, {
    strict: false,
    collection: 'ninds',
    usePushEach: true
}));
export const NindsCdeModel = migrationConn.model('nindsCde', new Schema({}, {
    strict: false,
    collection: 'nindsCdes',
    usePushEach: true
}));
export const NindsFormModel = migrationConn.model('nindsForm', new Schema({}, {
    strict: false,
    collection: 'nindsForms',
    usePushEach: true
}));

// NCI
export const MigrationNCIFormXmlModel = migrationConn.model('MigrationNCIFormXml', new Schema({}, {
    strict: false,
    collection: 'nciFormXml',
    usePushEach: true
}));
export const MigrationNCICdeXmlModel = migrationConn.model('MigrationNCICdeXml', new Schema({}, {
    strict: false,
    collection: 'nciCdeXml',
    usePushEach: true
}));

// EYE GENE
export const MigrationEyeGENELoincModel = migrationConn.model('EyeGENE_LOINC', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_LOINC',
    usePushEach: true
}));
export const MigrationEyeGENEAnswerListModel = migrationConn.model('EyeGENE_AnswerList', new Schema({}, {
    strict: false,
    collection: 'EyeGENE_AnswerList',
    usePushEach: true
}));

//NEW BORN SCREENING
export const MigrationNewbornScreeningCDEModel = migrationConn.model('NewbornScreening_CDE', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_CDE',
    usePushEach: true
}));
export const MigrationNewBornScreeningFormModel = migrationConn.model('NewbornScreening_Form', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_Form',
    usePushEach: true
}));
export const MigrationNewBornScreeningAnswerListModel = migrationConn.model('NewbornScreening_AnswerList', new Schema({}, {
    strict: false,
    collection: 'NewbornScreening_AnswerList',
    usePushEach: true
}));

// MIGRATION
export const MigrationDataElementModel = migrationConn.model('MigrationDataElement', new Schema(deJson, {
    collection: 'dataelements',
    usePushEach: true
}));
export const MigrationFormModel = migrationConn.model('MigrationForm', new Schema(formJson, {
    collection: 'forms',
    usePushEach: true
}));
export const MigrationOrgModel = migrationConn.model('MigrationOrg', new Schema(orgJson, {
    collection: 'orgs',
    usePushEach: true
}));

// PHENX
export const MeasureModel = migrationConn.model('Measure', new Schema({}, {
    strict: false,
    collection: 'Measure',
    usePushEach: true
}));
export const ProtocolModel = migrationConn.model('Protocol', new Schema({}, {
    strict: false,
    collection: 'Protocol',
    usePushEach: true
}));
export const MigrationCacheModel = migrationConn.model('MigrationCache', new Schema({}, {
    strict: false,
    collection: 'Cache',
    usePushEach: true
}));
export const MigrationPhenxRedcapModel = migrationConn.model('MigrationPhenxRedcapModel', new Schema({}, {
    strict: false,
    collection: 'PhenxRedcap',
    usePushEach: true
}));
export const MigrationRedcapModel = migrationConn.model('MigrationRedcapModel', new Schema({}, {
    strict: false,
    collection: 'Redcap',
    usePushEach: true
}));
export const PhenxURL = "https://www.phenxtoolkit.org/protocols";
export const PHENX_ZIP_BASE_FOLDER = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/all';


// MIGRATION REFERENCE COLLECTION
export const MigrationPhenxToLoincMappingModel = migrationConn.model('MigrationPhenxToLoincMapping', new Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping',
    usePushEach: true
}));
export const MigrationVariableCrossReferenceModel = migrationConn.model('MigrationVariableCrossReference', new Schema({}, {
    strict: false,
    collection: 'VariableCrossReference',
    usePushEach: true
}));