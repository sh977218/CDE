import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { config } from 'server';
import { updateOrInsert } from 'server/cde/elastic';
import { validateSchema } from 'server/cde/mongo-cde';
import { AttachableDb } from 'server/mongo/base/attachableDb';
import { CrudHooks, isNotNull, PromiseOrValue } from 'server/mongo/base/baseDb';
import { DataElementDocument, dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { esClient } from 'server/system/elastic';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { itemAsElastic } from 'shared/item';
import { Attachment, ElasticQueryResponse } from 'shared/models.model';

const dataElementHooks: CrudHooks<DataElement, ObjectId> = {
    read: {
        post: (item) => {
            // if (item) {
            //     item.elementType = 'cde';
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
            return (validateSchema(item) as Promise<void>).then(() => {
                const valueDomain = item.valueDomain;
                if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
                    throw new Error(`Cde ${item.tinyId} Value List with empty permissible values.`);
                }
                return item;
            }, (err: any) => {
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

class DataElementDbMongo extends AttachableDb<DataElement, ObjectId> implements DataElementDb {
    constructor(model: Model<DataElementDocument>) {
        super(model, dataElementHooks, 'updated');
    }

    cache = {
        byTinyIdList: (idList: string[], size: number): Promise<DataElementElastic[]> => {
            idList = idList.filter(id => !!id);
            return esClient.search<ElasticQueryResponse<DataElementElastic>>({
                index: config.elastic.index.name,
                body: {
                    query: {
                        ids: {
                            values: idList
                        }
                    },
                    size,
                }
            })
                .then(response => {
                    // TODO: possible to move this sort to elastic search?
                    response.body.hits.hits.sort((a, b) => idList.indexOf(a._id) - idList.indexOf(b._id));
                    return response.body.hits.hits.map(h => h._source);
                });
        }
    }

    attach(id: string, attachment: Attachment): Promise<DataElement | null> {
        return this.attachmentAdd(new ObjectId(id), attachment);
    }

    byExisting(item: DataElement): Promise<DataElement | null> {
        return this.findOne({_id: item._id, tinyId: item.tinyId});
    }

    byId(id: string): Promise<DataElement | null> {
        return this.findOneById(new ObjectId(id));
    }

    byKey(key: string): Promise<DataElement | null> {
        return this.byTinyId(key);
    }

    byTinyId(tinyId: string): Promise<DataElement | null> {
        return this.findOne({tinyId, archived: false});
    }

    byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<DataElement | null> {
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

    byTinyIdAndVersionOptional(tinyId: string, version: string | undefined): Promise<DataElement | null> {
        if (version) {
            return this.byTinyIdAndVersion(tinyId, version);
        } else {
            return this.byTinyId(tinyId);
        }
    }

    byTinyIdList(tinyIdList: string[]): Promise<DataElement[]> {
        return this.model.find({archived: false})
            .where('tinyId').in(tinyIdList)
            .then(docs => Promise.all(
                tinyIdList
                    .map(t => docs.filter(item => item.tinyId === t)[0])
                    .filter(isNotNull)
                    .map<DataElement>(doc => doc.toObject())
                    .map(item => (this.hooks.read.post as (d: DataElement) => PromiseOrValue<DataElement>)(item))
            ));
    }

    byTinyIdListElastic(tinyIdList: string[]): Promise<DataElementElastic[]> {
        return this.model.find({archived: false})
            .where('tinyId').in(tinyIdList)
            .slice('valueDomain.permissibleValues', 10)
            .then(docs => Promise.all(
                tinyIdList
                    .map(t => docs.filter(item => item.tinyId === t)[0])
                    .filter(isNotNull)
                    .map<DataElement>(doc => doc.toObject())
                    .map(item => (this.hooks.read.post as (d: DataElement) => PromiseOrValue<DataElement>)(item))
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

    removeAttachment(id: string, attachmentIndex: number): Promise<DataElement | null> {
        return this.attachmentRemove(new ObjectId(id), attachmentIndex);
    }

    setDefaultAttachment(id: string, attachmentIndex: number, state: boolean): Promise<DataElement | null> {
        return this.attachmentSetDefault(new ObjectId(id), attachmentIndex, state);
    }

    updatePropertiesById(_id: ObjectId, setExpression: Partial<DataElement>): Promise<DataElement | null> {
        return super.updatePropertiesById(_id, setExpression);
    }

    versionByTinyId(tinyId: string): Promise<string | undefined> {
        return this.byTinyId(tinyId)
            .then(dataElement => dataElement ? dataElement.version : undefined);
    }
}

export const dataElementDb = new DataElementDbMongo(dataElementModel);