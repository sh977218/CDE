import { AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { CdeForm } from 'shared/form/form.model';

export interface FormDb extends AttachableDb<CdeForm> {
    byId(id: string): Promise<CdeForm | null>;
}
