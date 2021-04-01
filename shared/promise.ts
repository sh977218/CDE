import { CbRet3 } from 'shared/models.model';

export function delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

export function mapSeries<T, U>(array: T[], iterCb: CbRet3<Promise<U>, T, number, T[]>): Promise<U[]> {
    return array.reduce(
        (ready, code, i, array) => ready.then(
            results => iterCb(code, i, array).then(result => [...results, result])
        ),
        Promise.resolve<U[]>([])
    );
}

export async function withRetry<T>(cb: () => Promise<T>, retries: number = 1, waitMs: number = 0): Promise<T> {
    try {
        return await cb();
    }
    catch (e) {
        if (retries) {
            return delay(waitMs).then(() => withRetry(cb, retries - 1, waitMs));
        }
        return e;
    }
}
