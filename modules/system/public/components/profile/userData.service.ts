import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DataService, Drafts } from 'shared/models.model';

@Injectable()
export class UserDataService implements DataService {
    constructor(private http: HttpClient) {}

    getDrafts(): Observable<Drafts> {
        return this.http.get<Drafts>('/myDrafts');
    }
}
