import { Document, Model } from 'mongoose';
import { config } from 'server';
import { idSourceSchema } from 'server/mongo/mongoose/schema/idSource.schema';
import { establishConnection } from 'server/system/connections';
import { IdSource } from 'shared/models.model';

export type IdSourceDocument = Document<string, {}, IdSource> & IdSource;

const conn = establishConnection(config.database.appData);
export const idSourceModel: Model<IdSourceDocument> = conn.model('IdSource', idSourceSchema);
