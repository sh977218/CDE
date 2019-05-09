import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

import { Observable } from 'rxjs';
import { User } from 'shared/models.model';

@Injectable()
export class SettingsResolve implements Resolve<Observable<User>> {
    constructor(private router: Router,
                private http: HttpClient) {
    }

    resolve() {
        return this.http.get<User>('/server/user/')
    }
}