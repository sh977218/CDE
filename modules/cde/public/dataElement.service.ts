import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DataElement } from 'shared/de/dataElement.model';

@Injectable()
export class DataElementService {
    elt: DataElement;

    constructor(
        private http: HttpClient
    ) {
    }

    fetchDe(tinyId, version = undefined): Promise<DataElement> {
        return new Promise<DataElement>((resolve, reject) => {
            if (version || version === '') {
                this.http.get<DataElement>('/de/' + tinyId + '/version/' + version).subscribe(resolve, reject);
            } else {
                this.http.get<DataElement>('/de/' + tinyId).subscribe(resolve, reject);
            }
        });
    }
}
