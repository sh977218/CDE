import { AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { ObjectId } from 'shared/models.model';

export interface FormDb extends AttachableDb<CdeForm> {
    cache: {
        byTinyIdList: (idList: string[], size: number) => Promise<CdeFormElastic[]>;
    };
    byExisting(elt: CdeForm): Promise<CdeForm | null>;
    byId(id: string): Promise<CdeForm | null>;
    byKey(key: string): Promise<CdeForm | null>;
    byTinyId(tinyId: string): Promise<CdeForm | null>;
    byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<CdeForm | null>;
    byTinyIdAndVersionOptional(tinyId: string, version: string | undefined): Promise<CdeForm | null>;
    byTinyIdList(tinyIdList: string[]): Promise<CdeForm[]>;
    byTinyIdListElastic(tinyIdList: string[]): Promise<CdeFormElastic[]>;
    count(query: any): Promise<number>;
    exists(query: any): Promise<boolean>;
    updatePropertiesById(_id: ObjectId, setExpression: Partial<CdeForm>): Promise<CdeForm | null>;
    versionByTinyId(tinyId: string): Promise<string | undefined>;
}
