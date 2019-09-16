import { hostname } from 'os';
import { createConnection, Schema } from 'mongoose';

const migrationConn = createConnection('mongodb://miguser:password@localhost:27017/migration', {
    ssl: false,
    useCreateIndex: true,
    useNewUrlParser: true
});
migrationConn.once('open', function callback() {
    console.log('mongodb local migration connection open');
});

// LOINC
export const LoincModel = migrationConn.model('LOINC', new Schema({}, {
    strict: false,
    collection: 'LOINC',
    usePushEach: true
}));
export const LOINC_CLASSIFICATION_MAPPING = migrationConn.model('LoincClassificationMapping', new Schema({}, {
    strict: false,
    collection: 'LoincClassificationMapping',
    usePushEach: true
}));
export let LOINC_USERS_GUIDE = 'S:/MLB/CDE/LOINC/LOINCUsersGuide.pdf';

// NINDS
export const NindsModel = migrationConn.model('NINDS', new Schema({}, {
    strict: false,
    collection: 'ninds',
    usePushEach: true
}));

// PhenX
export const ProtocolModel = migrationConn.model('Protocol', new Schema({}, {
    strict: false,
    collection: 'Protocol',
    usePushEach: true
}));
export const PhenxURL = 'https://www.phenxtoolkit.org/protocols';
export let redCapZipFolder = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';
if (hostname() === 'Peter-PC') {
    redCapZipFolder = 'e:/www.phenxtoolkit.org/toolkit_content/redcap_zip/';
}