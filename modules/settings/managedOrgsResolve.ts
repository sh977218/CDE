import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs/observable/empty';
import { HttpClient } from '@angular/common/http';
import { Organization } from 'shared/models.model';

@Injectable()
export class ManagedOrgsResolve implements Resolve<Observable<Organization>> {
    constructor(private router: Router,
                private http: HttpClient) {
    }

    resolve() {
        return this.http.get<Organization>('/managedOrgs')
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return empty();
            }));
    }
}
