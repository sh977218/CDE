import * as mongoose from 'mongoose';
import { config } from '../system/parseConfig';
import { addStringtype } from '../system/mongoose-stringtype';

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

export const idSourceModel = conn.model('IdSource', idSourceSchema);

export async function findAllIdSources() {
    return idSourceModel.find();
}

export async function findById(id) {
    return idSourceModel.findOne({_id: id});
}

export async function saveIdSource(idSource) {
    return new idSourceModel(idSource).save();
}

export async function updateIdSourceById(id, idSource) {
    const newIdSource = {
        linkTemplateDe: idSource.linkTemplateDe,
        linkTemplateForm: idSource.linkTemplateForm,
        version: idSource.version
    };
    return idSourceModel.updateOne({_id: id}, newIdSource, {new: true});
}

export async function deleteIdSourceById(id) {
    return idSourceModel.updateOne({_id: id});
}
