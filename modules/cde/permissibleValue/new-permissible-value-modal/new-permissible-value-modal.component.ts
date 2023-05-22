import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { PermissibleValue } from 'shared/models.model';
import { UmlsTerm } from 'cde/permissibleValue/umls-term';

@Component({
    templateUrl: './new-permissible-value-modal.component.html',
})
export class NewPermissibleValueModalComponent {
    newPermissibleValue: PermissibleValue = new PermissibleValue();
    umlsTerms: UmlsTerm[] = [];
    private searchTerms = new Subject<string>();

    constructor(public http: HttpClient) {
        this.searchTerms
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term =>
                    term
                        ? this.http.get('/server/uts/searchUmls?searchTerm=' + term).pipe(catchError(() => EMPTY))
                        : EMPTY
                )
            )
            .subscribe((res: any) => {
                if (res?.result?.results) {
                    this.umlsTerms = res.result.results;
                } else {
                    this.umlsTerms = [];
                }
            });
    }

    lookupUmls() {
        this.searchTerms.next(this.newPermissibleValue.valueMeaningName);
    }

    selectFromUmls(term: UmlsTerm) {
        this.newPermissibleValue.valueMeaningName = term.name;
        this.newPermissibleValue.valueMeaningCode = term.ui;
        this.newPermissibleValue.codeSystemName = 'UMLS';
        if (!this.newPermissibleValue.permissibleValue && term.name) {
            this.newPermissibleValue.permissibleValue = term.name;
        }
    }
}
