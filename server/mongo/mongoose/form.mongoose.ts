import { Document, Model, QueryCursor } from 'mongoose';
import { formModel as oldFormModel } from 'server/form/mongo-form';
import { CdeForm } from 'shared/form/form.model';

export type FormDocument = Document & CdeForm;

export const formModel: Model<FormDocument> = oldFormModel;

export function getStream(condition: any): QueryCursor<FormDocument> {
    return formModel.find(condition).sort({_id: -1}).cursor();
}
