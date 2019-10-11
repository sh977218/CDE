import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';

export interface IdSource {
    _id: string;
    linkTemplateDe: string;
    linkTemplateForm: string;
    version?: string;
}
export type IdSourceDocument = Document & IdSource;

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

export const idSourceSchema = new Schema({
    _id: String,
    linkTemplateDe: {type: StringType, default: ''},
    linkTemplateForm: {type: StringType, default: ''},
    version: StringType,
}, {collection: 'idSource'});

export const idSourceModel: Model<IdSourceDocument> = conn.model('IdSource', idSourceSchema);

export async function findAllIdSources(): Promise<IdSourceDocument[]> {
    return idSourceModel.find();
}

export async function findById(id: string): Promise<IdSourceDocument | null> {
    return idSourceModel.findOne({_id: id});
}

export async function saveIdSource(idSource: IdSource) {
    return new idSourceModel(idSource).save();
}

export async function updateIdSourceById(id: string, idSource: IdSource): Promise<IdSourceDocument> {
    const newIdSource = {
        linkTemplateDe: idSource.linkTemplateDe,
        linkTemplateForm: idSource.linkTemplateForm,
        version: idSource.version
    };
    return idSourceModel.updateOne({_id: id}, newIdSource, {new: true});
}

export async function deleteIdSourceById(id: string): Promise<{ok?: number, n?: number}> {
    return idSourceModel.deleteOne({_id: id});
}
