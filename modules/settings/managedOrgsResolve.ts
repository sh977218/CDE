import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Organization } from 'shared/organization/organization';

@Injectable({ providedIn: 'root' })
export class ManagedOrgsResolve {
    constructor(private router: Router, private http: HttpClient) {}

    resolve() {
        return this.http.get<Organization>('/server/orgManagement/managedOrgs').pipe(
            catchError(() => {
                this.router.navigate(['/404']);
                return EMPTY;
            })
        );
    }
}
