import { Document, Model } from 'mongoose';
import { CbError1 } from 'shared/models.model';

export function exists<T extends Document>(modelOrQuery: Model<T>, condition: any, cb: CbError1<boolean>) {
    modelOrQuery.find(condition, {_id: 1}).limit(1).exec((err: any, results: any) => {
        cb(err, !!(results && results.length));
    });
}
