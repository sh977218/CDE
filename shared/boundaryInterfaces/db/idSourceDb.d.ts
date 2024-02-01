import { IdSource } from 'shared/models.model';

export interface IdSourceDb {
    byId(id: string): Promise<IdSource | null>;

    deleteOneById(id: string): Promise<void>;

    findAll(): Promise<IdSource[]>;

    save(idSource: IdSource): Promise<IdSource>;

    updateById(id: string, idSource: IdSource): Promise<IdSource>;
}
