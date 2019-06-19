import { storedQuerySchema } from '../../server/log/schemas';
import { config } from '../../server/system/parseConfig';

const connHelper = require('../system/connections');

const conn = connHelper.establishConnection(config.database.log);
export const StoredQueryModel = conn.model('StoredQuery', storedQuerySchema);

export function getStream(condition) {
    return StoredQueryModel.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    StoredQueryModel.countDocuments(condition, callback);
}

export const type = 'storedQuery';
export const name = 'storedQueries';
