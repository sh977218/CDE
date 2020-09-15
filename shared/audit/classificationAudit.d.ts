import { CurationStatus, DateType, ModuleItem, ObjectId } from 'shared/models.model';

export interface ClassificationAudit {
    action: 'add' | 'delete' | 'rename' | 'reclassify';
    date: DateType;
    elements: {
        tinyId?: string,
        version?: string,
        _id?: ObjectId,
        name?: string,
        status?: CurationStatus,
        eltType?: ModuleItem,
    }[];
    newname?: string;
    path: string[];
    user: {
        username: string,
    };
}
