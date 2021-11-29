import { DbPlugins } from 'server/dbPlugins';
import { articleDb } from 'server/mongo/articleDb';
import { dataElementDb } from 'server/mongo/dataElementDb';
import { formDb } from 'server/mongo/formDb';
import { idSourceDb } from 'server/mongo/idSourceDb';

export const mongoPlugins: DbPlugins = Object.freeze({
    article: articleDb,
    dataElement: dataElementDb,
    form: formDb,
    idSource: idSourceDb,
});
