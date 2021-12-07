import { Attachment, ObjectId } from 'shared/models.model';

export interface Attachable {
    _id: ObjectId;
    attachments: Attachment[];
}

export interface AttachableDb<T extends Attachable> {
    attach(_id: ObjectId, attachment: Attachment): Promise<T | null>;
    byId(id: ObjectId): Promise<T | null>;
    removeAttachment(_id: ObjectId, attachmentIndex: number): Promise<T | null>;
    setDefaultAttachment(_id: ObjectId, attachmentIndex: number, state: boolean): Promise<T | null>;
}
