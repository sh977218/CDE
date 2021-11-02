import { IdSourceDb } from 'shared/boundaryInterfaces/db/idSourceDb';

export type DbPlugins = Readonly<{
    idSource: IdSourceDb
}>;
