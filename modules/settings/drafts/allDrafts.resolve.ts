import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs';
import { DraftsService } from 'settings/drafts/drafts.service';
import { Article } from 'shared/article/article.model';

@Injectable()
export class AllDraftsResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                private draftSvc: DraftsService) {
    }

    resolve() {
        return this.draftSvc.allDrafts()
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return empty();
            }));
    }
}
