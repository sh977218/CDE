import { DataElement } from 'shared/de/dataElement.model';

export class DataElementService {
    static fetchDe(tinyId: string, version?: string): Promise<DataElement> {
        return fetch('/server/de/' + tinyId + (version || version === '' ? '/version/' + version : ''))
            .then(res => res.json());
    }
}
