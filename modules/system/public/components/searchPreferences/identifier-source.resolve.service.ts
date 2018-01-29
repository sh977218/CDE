import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable()
export class IdentifierSourcesResolve implements Resolve<any> {
    identifierSources = [];

    constructor(
        private http: HttpClient
    ) {
    }

    resolve(): Promise<any> | boolean {
        let p = this.http.get('/identifierSources').toPromise();
        p.then(res => {
            if (res && res['_body'])
                this.identifierSources = JSON.parse(res['_body']);
        });
        return p;
    }
}
