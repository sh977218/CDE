import { Model } from 'mongoose';
import { BaseDb, CrudHooks, PromiseOrValue } from 'server/mongo/base/baseDb';
import { IdSourceDocument, idSourceModel } from 'server/mongo/mongoose/isSource.mongoose';
import { IdSourceDb } from 'shared/boundaryInterfaces/db/idSourceDb';
import { IdSource } from 'shared/models.model';

const idSourceHooks: CrudHooks<IdSource, string> = {
    read: {
        post: (idSource) => idSource,
    },
    save: {
        pre: (idSource) => idSource,
        post: (idSource) => idSource,
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {},
    },
};

class IdSourceDbMongo extends BaseDb<IdSource, string> implements IdSourceDb {
    constructor(model: Model<IdSourceDocument>) {
        super(model, idSourceHooks, null);
    }

    byId(id: string): Promise<IdSource | null> {
        return this.findOneById(id);
    }

    deleteOneById(_id: string): Promise<void> {
        return super.deleteOneById(_id);
    }

    findAll(): Promise<IdSource[]> {
        return this.model.find()
            .then(docs => Promise.all(docs
                .map(doc => doc.toObject<IdSource>())
                .map(idSource => (this.hooks.read.post as (i: IdSource) => PromiseOrValue<IdSource>)(idSource))
            ));
    }

    save(idSource: IdSource): Promise<IdSource> {
        return new this.model(idSource).save()
            .then(doc => doc.toObject<IdSource>())
            .then(idSource => (this.hooks.save.post as (i: IdSource) => PromiseOrValue<IdSource>)(idSource));
    }

    updateById(id: string, idSource: IdSource): Promise<IdSource> {
        const newIdSource: Omit<IdSource, '_id'> = {
            linkTemplateDe: idSource.linkTemplateDe,
            linkTemplateForm: idSource.linkTemplateForm,
            version: idSource.version
        };
        return this.model.updateOne({_id: id}, newIdSource, {upsert: true, new: true})
            .then();
    }
}

export const idSourceDb = new IdSourceDbMongo(idSourceModel);
