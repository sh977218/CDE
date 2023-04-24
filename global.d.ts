import { UserDocument } from 'server/user/userDb';
import { Item } from 'shared/models.model';

declare global {
    namespace Express {
        interface Request {
            item: Item;
        }
        type User = UserDocument
    }

    namespace PlaywrightTest {
        interface Matchers<R> {
            trimmedToBe(a: string): R;
        }
    }
}
