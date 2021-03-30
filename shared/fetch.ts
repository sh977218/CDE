import { Response } from 'node-fetch';

export function handle200(res: Response) {
    if (res.status !== 200) {
        throw new Error(res.status + ' ' + res.statusText);
    }
    return res;
}

export function handleErrors(res: Response) {
    if (!res.ok) { // status 200-299
        throw new Error(res.status + ' ' + res.statusText);
    }
    return res;
}

export function json(res: Response): Promise<any> {
    return res.json();
}

export function text(res: Response): Promise<string> {
    return res.text();
}
