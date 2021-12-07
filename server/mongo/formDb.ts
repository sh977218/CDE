import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { config } from 'server';
import { updateOrInsert } from 'server/form/elastic';
import { validateSchema } from 'server/form/mongo-form';
import { AttachableDb } from 'server/mongo/base/attachableDb';
import { CrudHooks, isNotNull, PromiseOrValue } from 'server/mongo/base/baseDb';
import { FormDocument, formModel } from 'server/mongo/mongoose/form.mongoose';
import { esClient } from 'server/system/elastic';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { itemAsElastic } from 'shared/item';
import { Attachment, ElasticQueryResponse } from 'shared/models.model';

const formHooks: CrudHooks<CdeForm, ObjectId> = {
    read: {
        post: (item) => {
            // if (item) {
            //     item.elementType = 'form';
            // }
            return item;
        },
    },
    save: {
        pre: (item) => {
            if (item.archived) {
                throw new Error('cannot edit archived');
            }
            // delete (item as any).elementType;
            return (validateSchema(item) as Promise<void>).then(() => item, (err: any) => {
                err.tinyId = item.tinyId;
                err.eltId = item._id.toString();
                throw err;
            });
        },
        post: (item) => {
            if (item) {
                updateOrInsert(item);
            }
            return item;
        },
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {},
    },
};

class FormDbMongo extends AttachableDb<CdeForm, ObjectId> implements FormDb {
    constructor(model: Model<FormDocument>) {
        super(model, formHooks, 'updated');
    }

    cache = {
        byTinyIdList: (idList: string[], size: number): Promise<CdeFormElastic[]> => {
            idList = idList.filter(id => !!id);
            return esClient.search<ElasticQueryResponse<CdeFormElastic>>({
                index: config.elastic.formIndex.name,
                body: {
                    query: {
                        ids: {
                            values: idList
                        }
                    },
                    size
                }
            })
                .then(response => {
                    // TODO: possible to move this sort to elastic search?
                    response.body.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
                    return response.body.hits.hits.map(h => h._source);
                });
        }
    }

    attach(id: string, attachment: Attachment): Promise<CdeForm | null> {
        return this.attachmentAdd(new ObjectId(id), attachment);
    }

    byExisting(item: CdeForm): Promise<CdeForm | null> {
        return this.findOne({_id: item._id, tinyId: item.tinyId});
    }

    byId(id: string): Promise<CdeForm | null> {
        return this.findOneById(new ObjectId(id));
    }

    byKey(key: string): Promise<CdeForm | null> {
        return this.byTinyId(key);
    }

    byTinyId(tinyId: string): Promise<CdeForm | null> {
        return this.findOne({tinyId, archived: false});
    }

    byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<CdeForm | null> {
        const query: any = {tinyId};
        if (version) {
            query.version = version;
        } else {
            query.$or = [{version: null}, {version: ''}];
        }
        return this.model.findOne(query).sort({updated: -1}).limit(1)
            .then(doc => doc && doc.toObject())
            .then(item => this.hooks.read.post(item));
    }

    byTinyIdAndVersionOptional(tinyId: string, version: string | undefined): Promise<CdeForm | null> {
        if (version) {
            return this.byTinyIdAndVersion(tinyId, version);
        } else {
            return this.byTinyId(tinyId);
        }
    }

    byTinyIdList(tinyIdList: string[]): Promise<CdeForm[]> {
        return this.model.find({archived: false})
            .where('tinyId').in(tinyIdList)
            .then(docs => Promise.all(
                tinyIdList
                    .map(t => docs.filter(item => item.tinyId === t)[0])
                    .filter(isNotNull)
                    .map<CdeForm>(doc => doc.toObject())
                    .map(item => (this.hooks.read.post as (f: CdeForm) => PromiseOrValue<CdeForm>)(item))
            ));
    }

    byTinyIdListElastic(tinyIdList: string[]): Promise<CdeFormElastic[]> {
        return this.model.find({archived: false})
            .where('tinyId').in(tinyIdList)
            .slice('valueDomain.permissibleValues', 10)
            .then(docs => Promise.all(
                tinyIdList
                    .map(t => docs.filter(item => item.tinyId === t)[0])
                    .filter(isNotNull)
                    .map<CdeForm>(doc => doc.toObject())
                    .map(item => (this.hooks.read.post as (f: CdeForm) => PromiseOrValue<CdeForm>)(item))
            ))
            .then(items => items
                .map(itemAsElastic)
            );
    }

    count(query: any): Promise<number> {
        return super.count(query);
    }

    exists(query: any): Promise<boolean> {
        return super.exists(query);
    }

    removeAttachment(id: string, attachmentIndex: number): Promise<CdeForm | null> {
        return this.attachmentRemove(new ObjectId(id), attachmentIndex);
    }

    setDefaultAttachment(id: string, attachmentIndex: number, state: boolean): Promise<CdeForm | null> {
        return this.attachmentSetDefault(new ObjectId(id), attachmentIndex, state);
    }

    updatePropertiesById(_id: ObjectId, setExpression: Partial<CdeForm>): Promise<CdeForm | null> {
        return super.updatePropertiesById(_id, setExpression);
    }

    versionByTinyId(tinyId: string): Promise<string | undefined> {
        return this.byTinyId(tinyId)
            .then(form => form ? form.version : undefined);
    }
}

export const formDb = new FormDbMongo(formModel);
