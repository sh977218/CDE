import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Resolve } from '@angular/router';

@Injectable()
export class IdentifierSourcesResolve implements Resolve<any> {
    identifierSources = [];

    constructor(private http: Http) {
    }

    resolve(): Promise<any> | boolean {
        let p = this.http.get('/identifiersSource').toPromise();
        p.then(res => {
            console.log(res);

//            this.identifierSources = res;
        });
        return p;
    }
}