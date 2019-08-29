import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import { config } from '../system/parseConfig';
import { Document } from 'mongoose';
import { Cb, MeshClassification } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

export const meshClassification = conn.model('meshClassification', new Schema({
    flatClassification: StringType,
    eltId: StringType,
    meshDescriptors: [StringType],
    flatTrees: [StringType]
}));

export function byId(id: string, callback: Cb<Document & MeshClassification>) {
    meshClassification.findById(id, callback);
}

export function byEltId(eltId, callback) {
    meshClassification.find({eltId}, callback);
}

export function byFlatClassification(flatClassification, callback) {
    meshClassification.find({flatClassification}, callback);
}

export function findAll(callback) {
    meshClassification.find({}, callback);
}

export function newMesh(mesh, callback) {
    new meshClassification(mesh).save(callback);
}
