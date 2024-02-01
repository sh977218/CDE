import { AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { ObjectId } from 'shared/models.model';

export interface DataElementDb extends AttachableDb<DataElement> {
    cache: {
        byTinyIdList: (idList: string[], size: number) => Promise<DataElementElastic[]>;
    };

    byExisting(item: DataElement): Promise<DataElement | null>;

    byId(id: string): Promise<DataElement | null>;

    byKey(key: string): Promise<DataElement | null>;

    byTinyId(tinyId: string): Promise<DataElement | null>;

    byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<DataElement | null>;

    byTinyIdAndVersionOptional(tinyId: string, version: string | undefined): Promise<DataElement | null>;

    byTinyIdList(tinyIdList: string[]): Promise<DataElement[]>;

    byTinyIdListElastic(tinyIdList: string[]): Promise<DataElementElastic[]>;

    count(query: any): Promise<number>;

    exists(query: any): Promise<boolean>;

    updatePropertiesById(_id: ObjectId, setExpression: Partial<DataElement>): Promise<DataElement | null>;

    versionByTinyId(tinyId: string): Promise<string | undefined>;
}
