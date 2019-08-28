export interface Article {
    _id: string;
    key?: string;
    body?: string;
    updated?: Date;
    created?: Date;
    attachments?: any;
    rssFeeds?: string[];
}
