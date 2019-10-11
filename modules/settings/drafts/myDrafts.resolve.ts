import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Article } from 'shared/article/article.model';
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs/observable/empty';
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
