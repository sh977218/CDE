import { IdSource } from 'shared/models.model';

export interface IdSourceDb {
    deleteById(id: string): Promise<{ok?: number, n?: number}>;
    findAll(): Promise<IdSource[]>;
    findById(id: string): Promise<IdSource | null>;
    save(idSource: IdSource): Promise<IdSource>;
    updateById(id: string, idSource: IdSource): Promise<void>;
}
