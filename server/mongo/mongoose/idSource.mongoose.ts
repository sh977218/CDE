import { Document, Model } from 'mongoose';
import { config } from 'server';
import { idSourceSchema } from 'server/mongo/mongoose/schema/idSource.schema';
import { establishConnection } from 'server/system/connections';
import { IdSource as IdSourceClient } from 'shared/models.model';

export type IdSource = IdSourceClient;
export type IdSourceDocument = Document<string, {}, IdSource> & IdSource;

const conn = establishConnection(config.database.appData);
export const idSourceModel: Model<IdSource> = conn.model('IdSource', idSourceSchema);
