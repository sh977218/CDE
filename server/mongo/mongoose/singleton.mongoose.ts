import { Document, Model } from 'mongoose';
import { config } from 'server';
import { singletonSchema } from 'server/mongo/mongoose/schema/singleton.schema';
import { establishConnection } from 'server/system/connections';
import { SingletonServer as Singleton } from 'shared/singleton.model';

export type SingletonDocument = Document<string, {}, Singleton> & Singleton;

const conn = establishConnection(config.database.appData);
export const singletonModel: Model<SingletonDocument> = conn.model('singleton', singletonSchema);
