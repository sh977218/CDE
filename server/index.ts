export { config } from 'server/config';

import { ObjectId as ObjectIdBson } from 'mongodb';
// tslint:disable-next-line:variable-name
export const ObjectId = ObjectIdBson;
export type ObjectId = ObjectIdBson;

// CommonJS limitation: finish all config updates before calling database code
import { DbPlugins } from 'server/dbPlugins';
import { mongoPlugins } from 'server/mongo/mongoPlugins';
export const dbPlugins: DbPlugins = mongoPlugins;
