import { DbPlugins } from 'server/dbPlugins';
import { articleDb } from 'server/mongo/articleDb';
import { boardDb } from 'server/mongo/boardDb';
import { dataElementDb } from 'server/mongo/dataElementDb';
import { formDb } from 'server/mongo/formDb';
import { idSourceDb } from 'server/mongo/idSourceDb';
import { singletonDb } from 'server/mongo/singletonDb';

export const mongoPlugins: DbPlugins = Object.freeze({
    article: articleDb,
    board: boardDb,
    dataElement: dataElementDb,
    form: formDb,
    idSource: idSourceDb,
    singleton: singletonDb,
});
