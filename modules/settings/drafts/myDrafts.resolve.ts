import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { empty, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Article } from 'shared/article/article.model';
import { DraftsService } from 'settings/drafts/drafts.service';

@Injectable()
export class MyDraftsResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                private draftSvc: DraftsService) {
    }

    resolve() {
        return this.draftSvc.myDrafts()
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return empty();
            }));
    }
}
