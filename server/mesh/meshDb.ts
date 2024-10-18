import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { MeshClassification } from 'shared/models.model';

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
) as any;

export function byId(id: string): Promise<MeshClassificationDocument | null> {
    return meshClassificationModal.findById(id);
}

export function byEltId(eltId: string): Promise<MeshClassificationDocument[]> {
    return meshClassificationModal.find({ eltId });
}

export function byFlatClassification(flatClassification: string): Promise<MeshClassificationDocument[]> {
    return meshClassificationModal.find({ flatClassification });
}

export function deleteAll() {
    return meshClassificationModal.deleteMany({});
}

export function findAll(): Promise<MeshClassificationDocument[]> {
    return meshClassificationModal.find({});
}

export function newMesh(mesh: MeshClassification): Promise<MeshClassificationDocument> {
    return new meshClassificationModal(mesh).save();
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
