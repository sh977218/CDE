import { ObjectId } from 'mongodb';
import { Cursor, Document, Model, QueryOptions } from 'mongoose';
import { dataElementModel as oldDataElementModel } from 'server/cde/mongo-cde';
import { DataElement } from 'shared/de/dataElement.model';

export type DataElementDocument = Document<ObjectId, {}, DataElement> & DataElement;

export const dataElementModel: Model<DataElementDocument> = oldDataElementModel;

export function getStream(condition: any): Cursor<DataElementDocument, QueryOptions<DataElement>> {
    return dataElementModel.find(condition).sort({_id: -1}).cursor();
}
