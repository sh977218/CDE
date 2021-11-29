import * as mongoose from 'mongoose';
import { Document, Model, Schema } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { IdSourceDb } from 'shared/boundaryInterfaces/db/idSourceDb';
import { IdSource } from 'shared/models.model';

type IdSourceDocument = Document & IdSource;

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);
const idSourceSchema = new Schema({
    _id: String,
    linkTemplateDe: {type: StringType, default: ''},
    linkTemplateForm: {type: StringType, default: ''},
    version: StringType,
}, {collection: 'idSource'});
const idSourceModel: Model<IdSourceDocument> = conn.model('IdSource', idSourceSchema);

class IdSourceDbMongo implements IdSourceDb {
    deleteById(id: string): Promise<{ok?: number, n?: number}> {
        return idSourceModel.deleteOne({_id: id})
            .then();
    }

    findAll(): Promise<IdSource[]> {
        return idSourceModel.find()
            .then(docs => docs.map(doc => doc.toObject()));
    }

    findById(id: string): Promise<IdSource | null> {
        return idSourceModel.findOne({_id: id})
            .then(doc => doc && doc.toObject());
    }

    save(idSource: IdSource): Promise<IdSource> {
        return new idSourceModel(idSource).save()
            .then(doc => doc.toObject());
    }

    updateById(id: string, idSource: IdSource): Promise<void> {
        const newIdSource: Omit<IdSource, '_id'> = {
            linkTemplateDe: idSource.linkTemplateDe,
            linkTemplateForm: idSource.linkTemplateForm,
            version: idSource.version
        };
        return idSourceModel.updateOne({_id: id}, newIdSource, {upsert: true})
            .then(() => {});
    }
}

export const idSourceDb = new IdSourceDbMongo();
