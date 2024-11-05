import { Document, Model } from 'mongoose';

export type PromiseOrValue<T> = T | Promise<T>;

export interface CrudHooks<T, U> {
    read: {
        post: (t: T | null) => PromiseOrValue<T | null>;
    };
    save: {
        pre: (t: T) => PromiseOrValue<T>;
        post: (t: T | null) => PromiseOrValue<T | null>;
    };
    delete: {
        pre: (u: U) => PromiseOrValue<U>;
        post: (u: U) => PromiseOrValue<void>;
    };
}

export abstract class BaseDb<T, U> {
    protected constructor(
        protected model: Model<Document<U, {}, T> & T>,
        protected hooks: CrudHooks<T, U>,
        protected updateDateField: keyof T | null
    ) {}

    protected count(query: any): Promise<number> {
        return this.model.countDocuments(query).then(count => count);
    }

    protected deleteOne(query: any): Promise<void> {
        return this.model.deleteOne(query).then(() => {});
    }

    protected deleteOneById(_id: U): Promise<void> {
        return Promise.resolve(this.hooks.delete.pre(_id))
            .then(_id => this.deleteOne({ _id }))
            .then(() => this.hooks.delete.post(_id));
    }

    protected exists(query: any): Promise<boolean> {
        return this.model
            .find(query, { _id: 1 })
            .limit(1)
            .then(results => !!(results && results.length));
    }

    protected findOne(query: any): Promise<T | null> {
        return this.model
            .findOne(query)
            .then(doc => doc && (doc.toObject() as T | null))
            .then(t => this.hooks.read.post(t));
    }

    protected findOneById(_id: U): Promise<T | null> {
        return this.findOne({ _id });
    }

    protected updateById(_id: U, updateExpression: any): Promise<T | null> {
        return this.model
            .findOneAndUpdate({ _id }, updateExpression, { new: true })
            .then(doc => doc && (doc.toObject() as T | null))
            .then(t => this.hooks.save.post(t));
    }

    protected updatePropertiesById(_id: U, setExpression: Partial<T>): Promise<T | null> {
        if (this.updateDateField && !setExpression[this.updateDateField]) {
            // no update date on metadata changes only: classification
            if (Object.keys(setExpression).some(key => !['classification'].includes(key))) {
                (setExpression[this.updateDateField] as any) = new Date();
            }
        }
        return this.updateById(_id, { $set: setExpression });
    }
}

export function isNotNull<T>(t: T | null): t is T {
    return !!t;
}
