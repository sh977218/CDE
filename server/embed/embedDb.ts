import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { Embed } from 'shared/models.model';
import { orderedList } from 'shared/regStatusShared';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);

const commonEmbedSchema = {
    nameLabel: StringType,
    pageSize: Number,
    primaryDefinition: {
        show: {type: Boolean, default: false},
        label: StringType,
        style: StringType
    },
    registrationStatus: {
        show: {type: Boolean, default: false},
        label: StringType
    },
    lowestRegistrationStatus: {type: StringType, enum: orderedList},
    properties: [
        {
            label: StringType,
            key: StringType,
            limit: Number
        }
    ],
    otherNames: [{
        label: StringType,
        tags: StringType,
        contextName: StringType
    }],
    classifications: [{
        label: StringType,
        startsWith: StringType,
        exclude: StringType,
        selectedOnly: Boolean
    }],
    ids: [
        {
            idLabel: StringType,
            source: StringType,
            version: Boolean,
            versionLabel: StringType
        }
    ]
};
const embedJson = {
    org: StringType,
    name: StringType,
    height: Number,
    width: Number,
    cde: {
        ...commonEmbedSchema,
        linkedForms: {
            show: {type: Boolean, default: false},
            label: StringType
        },
        permissibleValues: Boolean,
    },
    form: {
        ...commonEmbedSchema,
        cdes: {type: Boolean, default: false},
        nbOfQuestions: {type: Boolean, default: false},
        sdcLink: {type: Boolean, default: false}
    }
};

const embedSchema = new Schema(embedJson);

export type EmbedDocument = Document & Embed;
export const embedModel: Model<EmbedDocument> = conn.model('Embed', embedSchema);
