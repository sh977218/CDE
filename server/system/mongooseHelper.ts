import { CbError } from '../../shared/models.model';

export function exists(ModelOrQuery, condition, cb: CbError<boolean>) {
    ModelOrQuery.find(condition, {"_id" : 1}).limit(1).exec((err, results) => {
        cb(err, !!(results && results.length));
    });
}
