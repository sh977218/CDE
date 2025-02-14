import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DraftsService } from 'settings/drafts/drafts.service';

@Injectable({ providedIn: 'root' })
export class MyOrgDraftsResolve {
    constructor(private router: Router, private draftSvc: DraftsService) {}

    resolve() {
        return this.draftSvc.myOrgDrafts().pipe(
            catchError(() => {
                this.router.navigate(['/404']);
                return EMPTY;
            })
        );
    }
}
