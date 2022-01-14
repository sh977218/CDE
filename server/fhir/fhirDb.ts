import * as mongoose from 'mongoose';
import { config } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { FhirApp, FhirObservationInfo } from 'shared/form/form.model';
import { Document, Model } from 'mongoose';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);

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

export const fhirAppsModel: Model<FhirApp & Document> = conn.model('FhirApp', fhirAppSchema);
export const fhirObservationInfoModel: Model<FhirObservationInfo & Document>
    = conn.model('FhirObservationInfo', fhirObservationInformationSchema);
