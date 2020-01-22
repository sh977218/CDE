import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Organization } from 'shared/models.model';

@Injectable()
export class ManagedOrgsResolve implements Resolve<Observable<Organization>> {
    constructor(private router: Router,
                private http: HttpClient) {
    }

    resolve() {
        return this.http.get<Organization>('/server/orgManagement/managedOrgs')
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return empty();
            }));
    }
}
