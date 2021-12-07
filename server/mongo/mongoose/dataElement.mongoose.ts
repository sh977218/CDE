import { Document, Model, QueryCursor } from 'mongoose';
import { dataElementModel as oldDataElementModel } from 'server/cde/mongo-cde';
import { DataElement } from 'shared/de/dataElement.model';

export type DataElementDocument = Document & DataElement;

export const dataElementModel: Model<DataElementDocument> = oldDataElementModel;

export function getStream(condition: any): QueryCursor<DataElementDocument> {
    return dataElementModel.find(condition).sort({_id: -1}).cursor();
}
