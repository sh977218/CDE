import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Resolve } from '@angular/router';

@Injectable()
export class IdentifierSourcesResolve implements Resolve<any> {
    identifierSources = [];

    constructor(private http: Http) {
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