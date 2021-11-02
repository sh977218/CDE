import { DbPlugins } from 'server/dbPlugins';
import { idSourceDb } from 'server/mongo/idSourceDb';

export const mongoPlugins: DbPlugins = Object.freeze({
    idSource: idSourceDb
});
