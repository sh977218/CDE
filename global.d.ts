import { Item } from 'shared/models.model';

declare global {
    namespace Express {
        interface Request {
            item: Item;
            // user?: any;
        }
    }
}
