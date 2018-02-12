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

    get(tinyId) {
        return this.http.get('/de/' + tinyId);
    }
}
