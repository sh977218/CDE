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
    collection: 'NINDS',
    usePushEach: true
}));

// PhenX
export const PROTOCOL = migrationConn.model('PROTOCOL', new Schema({}, {
    strict: false,
    collection: 'Protocol',
    usePushEach: true
}));
export const PhenxURL = 'https://www.phenxtoolkit.org/protocols';
let redCapZipFolder = 'S:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';

let sickleCellDataElementsXlsx = 'S:/MLB/CDE/NHLBI/DataElements.xlsx';
let sickleCellFormMappingXlsx = 'S:/MLB/CDE/NHLBI/SickleCell_NLM_FormMapping.xlsx';
let vteDataElementsMappingCsv = 'S:/MLB/CDE/NHLBI/VTEdataelements_2021-07-09.csv';

let DMDXlsx = 'S:/MLB/CDE/NICHD/DMD Data Dictionary - NLM 2021-06.xlsx';
let krabbeDataElementsXlsx = 'S:/MLB/CDE/NICHD/KrabbeWWR_CDEs.xlsx';
let SocialDeterminantsOfHealthCsv = 'S:/MLB/CDE/NINR/SocialDeterminantsOfHealth_06152020.csv';
let SocialDeterminantsOfHealthXlsx = 'S:/MLB/CDE/NINR/BRICSNINRSocDetHealth_NLM_2020-11-30.xlsx';
let RED_CAP_CSV = "S:/MLB/CDE/REDCap/RADxUPDev_DataDictionary_2020-12-30.csv";
let radxExecutiveCommittee = 'S:/MLB/CDE/RADX/RADx_Exec_CDEs_2021-07-29_NLM-QA.csv';

if (hostname() === 'Peter-PC') {
    redCapZipFolder = 'e:/www.phenxtoolkit.org/toolkit_content/redcap_zip/';
    sickleCellDataElementsXlsx = 'C:/Users/Peter/Downloads/SickleCellDataElements_20200305.xlsx';
    sickleCellFormMappingXlsx = 'C:/Users/Peter/Downloads/SickleCell_NLM_FormMapping.xlsx';
    SocialDeterminantsOfHealthXlsx = 'C:/Users/Peter/Downloads/BRICSNINRSocDetHealth_NLM_2020-11-30.xlsx';
    RED_CAP_CSV = 'C:/Users/Peter/Downloads/RADxUPDev_DataDictionary_2020-12-30.csv';
    DMDXlsx = 'C:/Users/Peter/Downloads/DMD Data Dictionary - NLM 2021-06.xlsx';
}
export {
    redCapZipFolder,
    sickleCellDataElementsXlsx,
    sickleCellFormMappingXlsx,
    krabbeDataElementsXlsx,
    SocialDeterminantsOfHealthCsv,
    SocialDeterminantsOfHealthXlsx,
    RED_CAP_CSV,
    DMDXlsx,
    vteDataElementsMappingCsv,
    radxExecutiveCommittee
};
