import { forwardRef, Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, mergeMap } from 'rxjs/operators';
import { EMPTY, Observable, of } from 'rxjs';

@Injectable()
export class FormResolve implements Resolve<Observable<any>> {
    constructor(
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => HttpClient)) private httpClient: HttpClient
    ) {}

    resolve(route: ActivatedRouteSnapshot) {
        const tinyId = route.queryParams.tinyId;
        return this.httpClient.get('/server/form/draft/' + tinyId).pipe(
            mergeMap((res: any) => {
                if (res) {
                    return of(res);
                } else {
                    return this.httpClient.get('/server/form/forEdit/' + tinyId);
                }
            }),
            catchError(err => {
                this.router.navigate(['/404']);
                return EMPTY;
            })
        );
    }
}
