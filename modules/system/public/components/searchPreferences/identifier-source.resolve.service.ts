import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable()
export class IdentifierSourcesResolve implements Resolve<any> {
    identifierSources = [];

    constructor(private http: HttpClient) {
    }

    resolve(): Promise<any> | boolean {
        let p = this.http.get<any[]>('/identifierSources').toPromise<any[]>();
        p.then(res => {
            if (res) this.identifierSources = res;
        });
        return p;
    }
}
