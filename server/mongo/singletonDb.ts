import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { BaseDb, CrudHooks, PromiseOrValue } from 'server/mongo/base/baseDb';
import { SingletonDocument, singletonModel } from 'server/mongo/mongoose/singleton.mongoose';
import { SingletonDb } from 'shared/boundaryInterfaces/db/singletonDb';
import { SingletonServer as Singleton } from 'shared/singleton.model';

const singletonHooks: CrudHooks<Singleton, string> = {
    read: {
        post: (singleton) => singleton,
    },
    save: {
        pre: (singleton) => singleton,
        post: (singleton) => singleton,
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {},
    },
};

class SingletonDbMongo extends BaseDb<Singleton, string> implements SingletonDb {
    constructor(model: Model<SingletonDocument>) {
        super(model, singletonHooks, 'updated');
    }

    byId(_id: string): Promise<Singleton | null> {
        return this.findOneById(_id);
    }

    deleteOneById(_id: string): Promise<void> {
        return super.deleteOneById(_id);
    }

    exists(query: any): Promise<boolean> {
        return super.exists(query);
    }

    startEdit(_id: string, user: ObjectId): Promise<Singleton | null> {
        return this.model.findOneAndUpdate(
            {_id, updateInProgress: null},
            {$set: {updateInProgress: {updated: new Date(), updatedBy: user}}},
            {upsert: true, new: true}
        )
            .then(newSingleton => newSingleton.toObject<Singleton>());
    }

    update(_id: string, query: {}, userId: ObjectId, setClause: {}): Promise<Singleton> {
        return this.model.findOneAndUpdate(
            Object.assign(query, {_id}),
            {$set: Object.assign({updated: new Date(), updatedBy: userId}, setClause)},
            {upsert: true, new: true}
        )
            .then(newSingleton => newSingleton.toObject<Singleton>())
            .then(singleton => (this.hooks.save.post as (a: Singleton) =>
                PromiseOrValue<Singleton>)(singleton)); // TODO: TypeScript/issues/37181
    }
}

export const singletonDb = new SingletonDbMongo(singletonModel);
