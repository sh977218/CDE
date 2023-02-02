import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';

export class DataElementService {
    static fetchDe(tinyId: string, version?: string): Promise<DataElement> {
        return fetch(ITEM_MAP.cde.api + tinyId + (version || version === '' ? '/version/' + version : '')).then(res =>
            res.json()
        );
    }
}
