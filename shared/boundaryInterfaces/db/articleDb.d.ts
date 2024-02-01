import { Article } from 'shared/article/article.model';
import { AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';

export interface ArticleDb extends AttachableDb<Article> {
    byId(id: string): Promise<Article | null>;

    byKey(key: string): Promise<Article | null>;

    exists(query: any): Promise<boolean>;

    update(article: Article): Promise<Article>;
}
