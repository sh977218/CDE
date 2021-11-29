import { AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { DataElement } from 'shared/de/dataElement.model';

export interface DataElementDb extends AttachableDb<DataElement> {
    byId(id: string): Promise<DataElement | null>;
}
