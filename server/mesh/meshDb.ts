import * as mongoose from 'mongoose';
import { addStringtype } from '../../server/system/mongoose-stringtype';
import { config } from '../../server/system/parseConfig';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

export const MeshClassification = conn.model('meshClassification', new Schema({
    flatClassification: StringType,
    eltId: StringType,
    meshDescriptors: [StringType],
    flatTrees: [StringType]
}));

export function byId(id, callback) {
    MeshClassification.findById(id, callback);
}

export function byEltId(eltId, callback) {
    MeshClassification.find({eltId: eltId}, callback);
}

export function byFlatClassification(flatClassification, callback) {
    MeshClassification.find({flatClassification: flatClassification}, callback);
}

export function findAll(callback) {
    MeshClassification.find({}, callback);
}

export function newMesh(mesh, callback) {
    new MeshClassification(mesh).save(callback);
}
