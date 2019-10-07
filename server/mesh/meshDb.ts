import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { config } from 'server/system/parseConfig';
import { Cb, CbError, MeshClassification } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

export type MeshClassificationDocument = Document & MeshClassification;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

export const meshClassification = conn.model('meshClassification', new Schema({
    flatClassification: StringType,
    eltId: StringType,
    meshDescriptors: [StringType],
    flatTrees: [StringType]
}));

export function byId(id: string, callback: CbError<MeshClassificationDocument>) {
    meshClassification.findById(id, callback);
}

export function byEltId(eltId: string, callback: CbError<MeshClassificationDocument[]>) {
    meshClassification.find({eltId}, callback);
}

export function byFlatClassification(flatClassification: string, callback: CbError<MeshClassificationDocument[]>) {
    meshClassification.find({flatClassification}, callback);
}

export function findAll(callback: CbError<MeshClassificationDocument[]>) {
    meshClassification.find({}, callback);
}

export function newMesh(mesh: MeshClassification, callback: CbError<MeshClassificationDocument>) {
    new meshClassification(mesh).save(callback);
}
