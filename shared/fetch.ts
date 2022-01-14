import { Response } from 'node-fetch';

export function isStatus(status: number[]) {
    return (res: Response): Response => {
        if (!status.includes(res.status)) {
            throw `http status code expected ${status}, got ${res.status}(${res.statusText})`;
        }
        return res;
    }
}

export function handleErrors(res: Response): Response {
    if (!res.ok) { // status 200-299
        throw 'http error code ' + res.status + ' ' + res.statusText;
    }
    return res;
}

export function json<T>(res: Response): Promise<T> {
    return res.json();
}

export function text(res: Response): Promise<string> {
    return res.text();
}
