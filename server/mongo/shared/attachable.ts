import { Document, Model } from 'mongoose';
import { updateById } from 'server/mongo/shared/mongoUtils';
import { Attachable } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { Attachment } from 'shared/models.model';

export function attachmentAdd<T extends Attachable>(model: Model<Document & T>, _id: string, attachment: Attachment): Promise<T> {
    return updateById(model, _id, {$push: {attachments: attachment}});
}

export function attachmentRemove<T extends Attachable>(model: Model<Document & T>, _id: string,
                                                       attachmentIndex: number): Promise<T> {
    return updateById(model, _id, {$unset: {[`attachments.${attachmentIndex}`]: 1}})
        .then(() => updateById(model, _id, {$pull: {attachments: null}}));
}

export function attachmentSetDefault<T extends Attachable>(model: Model<Document & T>, _id: string,
                                                           attachmentIndex: number, state: boolean): Promise<T> {
    return updateById(model, _id,{$set: {'attachments.$[].isDefault': false}})
        .then(() => updateById(model, _id,{$set: {[`attachments.${attachmentIndex}.isDefault`]: state}}));
}
