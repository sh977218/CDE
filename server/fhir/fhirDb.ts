import * as mongoose from 'mongoose';
import { config } from 'server';
import { addStringtype } from 'server/system/mongoose-stringtype';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('server/system/connections');

const conn = connHelper.establishConnection(config.database.appData);

const fhirAppSchema = new Schema({
    clientId: String,
    dataEndpointUrl: String,
    forms: [
        {tinyId: String}
    ],
    mapping: [{
        cdeSystem: StringType,
        cdeCode: StringType,
        fhirSystem: StringType,
        fhirCode: StringType,
    }],
}, {collection: 'fhirapps'});

const fhirObservationInformationSchema = new Schema({
    _id: String,
    categories: [{
        type: String,
        enum: ['social-history', 'vital-signs', 'imaging', 'laboratory', 'procedure', 'survey', 'exam', 'therapy']
    }],
}, {collection: 'fhirObservationInfo'});

export const FhirApps = conn.model('FhirApp', fhirAppSchema);
export const FhirObservationInfo = conn.model('FhirObservationInfo', fhirObservationInformationSchema);
