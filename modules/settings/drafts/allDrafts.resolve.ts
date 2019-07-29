import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Article } from 'core/article/article.model';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { DraftsService } from 'settings/drafts/drafts.service';

@Injectable()
export class AllDraftsResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                private draftSvc: DraftsService) {
    }

    resolve() {
        return this.draftSvc.allDrafts()
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return EMPTY;
            }));
    }
}
