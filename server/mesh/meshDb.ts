import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { CbError, CbError1, MeshClassification } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

export type MeshClassificationDocument = Document & MeshClassification;

const MeshClassificationSchema = new Schema({
    flatClassification: StringType,
    meshDescriptors: [StringType],
    flatTrees: [StringType],
    created: Date,
    updated: Date,
});

const conn = establishConnection(config.database.appData);

const meshClassificationModal: Model<MeshClassificationDocument> = conn.model(
    'meshClassification',
    MeshClassificationSchema
);

export function byId(id: string, callback: CbError1<MeshClassificationDocument>) {
    meshClassificationModal.findById(id, callback);
}

export function byEltId(eltId: string, callback: CbError1<MeshClassificationDocument[]>) {
    meshClassificationModal.find({ eltId }, callback);
}

export function byFlatClassification(flatClassification: string, callback: CbError1<MeshClassificationDocument[]>) {
    meshClassificationModal.find({ flatClassification }, callback);
}

export function deleteAll(cb: CbError) {
    meshClassificationModal.deleteMany({}, cb);
}

export function findAll(callback: CbError1<MeshClassificationDocument[]>) {
    meshClassificationModal.find({}, callback);
}

export function newMesh(mesh: MeshClassification, callback: CbError1<MeshClassificationDocument>) {
    new meshClassificationModal(mesh).save(callback);
}

export async function updateMeshByClassification(
    flatClassification: string,
    flatTrees: string[],
    meshDescriptors: string[]
) {
    const updatedMeshClassificationObj: any = {
        flatClassification,
        flatTrees,
        meshDescriptors,
        updated: new Date(),
    };
    await meshClassificationModal.updateOne({ flatClassification }, updatedMeshClassificationObj, { upsert: true });
}
