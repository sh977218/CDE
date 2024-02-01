import * as assert from 'assert';
import { Response } from 'express';

export function writeOutArrayStream(res: Response): [(data: string | null) => void, Promise<boolean>] {
    let following = false;
    let resolve: ((b: boolean) => void) | null;
    return [
        data => {
            assert(resolve, 'Response already sent');
            if (!data) {
                if (following) {
                    res.write(']');
                    res.send();
                }
                resolve(following);
                resolve = null;
                return;
            }
            if (!following) {
                res.type('application/json');
                res.write('[');
                following = true;
            } else {
                res.write(',');
            }
            res.write(data);
        },
        new Promise(r => (resolve = r)),
    ];
}
