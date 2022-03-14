import { ArticleDb } from 'shared/boundaryInterfaces/db/articleDb';
import { BoardDb } from 'shared/boundaryInterfaces/db/boardDb';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';
import { IdSourceDb } from 'shared/boundaryInterfaces/db/idSourceDb';
import { SingletonDb } from 'shared/boundaryInterfaces/db/singletonDb';
import { assertUnreachable, ModuleAll, ModuleItem } from 'shared/models.model';

export type DbPlugins = Readonly<{
    article: ArticleDb;
    board: BoardDb;
    dataElement: DataElementDb;
    form: FormDb;
    idSource: IdSourceDb;
    singleton: SingletonDb;
}>;

export function moduleItemToDbName(module: ModuleItem) {
    switch (module) {
        case 'cde':
            return 'dataElement';
        case 'form':
            return 'form';
        default:
            throw assertUnreachable(module);
    }
}

export function moduleToDbName(module: ModuleAll) {
    switch (module) {
        case 'board':
            return 'board';
        case 'cde':
            return 'dataElement';
        case 'form':
            return 'form';
        default:
            throw assertUnreachable(module);
    }
}
