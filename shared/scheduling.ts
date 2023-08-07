import { Agent } from 'https';
import fetch, { RequestInit } from 'node-fetch';
import { handleErrors, isStatus, json, text } from 'shared/fetch';
import { delay, withRetry } from 'shared/promise';

const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

// rpm 0 for no rate limit
export function schedulingExecutor(parallel = 5, rpm = 10) {
    const workers: (()=>void)[] = [];
    const idleWorkers: (()=>void)[] = [];
    const reqQueue: (()=>void)[] = [];
    const throttle = throttler(rpm);
    let idleListener: Promise<void> | null = null;
    let idleListenerResolve: (()=>void) | null = null;

    for(let i = 0; i < parallel; i++) {
        workers.push(executor());
    }

    function executor() {
        async function run(): Promise<void> {
            const req = reqQueue.shift();
            if (req) {
                await throttle();
                await req();
                run(); // continue running
            } else {
                idleWorkers.push(run); // suspend
                if (idleListener && workers.length === idleWorkers.length) {
                    idleListenerResolve?.();
                    idleListener = null;
                    idleListenerResolve = null;
                }
            }
        }
        run();
        return run;
    }

    return {
        run: <T>(req: () => Promise<T>): Promise<T> => new Promise(resolve => {
            reqQueue.push(() => {
                const promise = req();
                resolve(promise);
                return promise;
            });
            idleWorkers.shift()?.();
        }),
        idle: (): Promise<void> => idleListener || (idleListener = new Promise(resolve => idleListenerResolve = resolve))
    };
}

export function throttler(rpm: number): () => Promise<void> {
    let runs = 0;
    let clearRuns: Promise<void> | null = null;
    function throttle(): Promise<void> {
        if (rpm <= 0) {
            return Promise.resolve();
        }
        runs++;
        if (!clearRuns) {
            clearRuns = delay(60000).then(() => {
                runs = 0;
                clearRuns = null;
            });
        }
        return runs <= rpm
            ? Promise.resolve()
            : clearRuns.then(() => throttle());
    }
    return throttle;
}

export function serverRequest(url: string, retries = 1, parallel = 5, rpm = 10) {
    const {run} = schedulingExecutor(parallel, rpm);
    function send(path: string, fetchOptions: RequestInit) {
        if (/^https:\/\//i.test(url)) {
            fetchOptions.agent = httpsAgent;
        }
        return withRetry(() => fetch(url + path, fetchOptions), retries)
            .then(handleErrors)
            .then(isStatus([200]));
    }
    return {
        requestJson: <T>(path: string, options: RequestInit): Promise<T> => run(() => send(path, options).then(res => json<T>(res))),
        requestText: (path: string): Promise<string> => run(() => send(path, {}).then(res => text(res))),
    };
}
