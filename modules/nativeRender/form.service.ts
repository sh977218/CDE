import { ObjectId } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';

export function convertUnits(value: number, from: string, to: string): Promise<number> {
    return fetch('/server/ucumConvert?value=' + value + '&from=' + from + '&to=' + to)
        .then(res => res.text())
        .then(value => parseFloat(value));
}

export function fetchForm(tinyId: string, version?: string): Promise<CdeForm> {
    return fetch('/api/form/' + tinyId + (version || version === '' ? '/version/' + version : '')).then(res =>
        res.json()
    );
}

export function fetchFormById(id: ObjectId): Promise<CdeForm> {
    return fetch('/server/form/byId/' + id).then(res => res.json());
}

export function fetchFormStringById(id: ObjectId, queryString: string = ''): Promise<string> {
    return fetch('/server/form/byId/' + id + queryString).then(res => res.text());
}
