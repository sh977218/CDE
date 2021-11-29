import { Attachment, ObjectId } from 'shared/models.model';

export interface Article {
    _id: ObjectId;
    key?: string;
    body: string;
    updated?: Date;
    created?: Date;
    attachments: Attachment[];
    rssFeeds?: string[];
}
