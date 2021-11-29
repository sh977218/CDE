import { ObjectId } from 'mongodb';
import { Document, Model } from 'mongoose';

export function byId<T>(model: Model<Document & T>, _id: string): Promise<T | null> {
    return model.findOne({_id})
        .then(doc => doc && doc.toObject());
}

export function updateById<T>(model: Model<Document & T>, _id: string, updateExpression: any): Promise<T> {
    return model.findOneAndUpdate({_id: new ObjectId(_id)}, updateExpression, {new: true})
        .then(doc => doc && doc.toObject());
}
