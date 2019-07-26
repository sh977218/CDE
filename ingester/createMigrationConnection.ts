import { createConnection, Schema } from 'mongoose';
import { config } from 'server/system/parseConfig';

let migrationConfig = config.database.migration;

let migrationConn = createConnection(migrationConfig.uri, migrationConfig.options);
migrationConn.once('open', function callback() {
    console.info('mongodb ' + migrationConfig.db + ' connection open');
});

// LOINC
export const LoincModel = migrationConn.model('LOINC', new Schema({}, {
    strict: false,
    collection: 'LOINC',
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

// PHENX
export const ProtocolModel = migrationConn.model('Protocol', new Schema({}, {
    strict: false,
    collection: 'Protocol',
    usePushEach: true
}));
export const PhenxURL = "https://www.phenxtoolkit.org/protocols";
export const redCapZipFolder = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';


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