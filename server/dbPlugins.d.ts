import { ArticleDb } from 'shared/boundaryInterfaces/db/articleDb';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';
import { IdSourceDb } from 'shared/boundaryInterfaces/db/idSourceDb';

export type DbPlugins = Readonly<{
    article: ArticleDb;
    dataElement: DataElementDb;
    form: FormDb;
    idSource: IdSourceDb;
}>;
