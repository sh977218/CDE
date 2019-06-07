export class Article {
    _id?: string;
    key?: string;
    body?: string;
    updated?: Date;
    created?: Date;
    attachments?: any;
    rssFeeds?: any[] = [];
}