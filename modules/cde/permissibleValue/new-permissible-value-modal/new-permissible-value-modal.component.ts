import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UmlsTerm } from 'cde/permissibleValue/umls-term';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { PermissibleValue } from 'shared/models.model';

@Component({
    templateUrl: './new-permissible-value-modal.component.html',
    styles: [
        `
            label {
                width: 100%;
                margin-bottom: 1rem;
            }
        `,
    ],
    imports: [MatDialogModule, FormsModule, NgIf, NgForOf],
    standalone: true,
})
export class NewPermissibleValueModalComponent {
    newPermissibleValue: PermissibleValue = new PermissibleValue();
    umlsTerms: UmlsTerm[] = [];
    private searchTerms = new Subject<string>();

    constructor(public dialogRef: MatDialogRef<NewPermissibleValueModalComponent>, public http: HttpClient) {
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
        this.searchTerms.next(this.newPermissibleValue.valueMeaningName || '');
    }

    saveDialog() {
        if (!this.newPermissibleValue.valueMeaningName) {
            this.newPermissibleValue.valueMeaningName = this.newPermissibleValue.permissibleValue;
        }
        this.dialogRef.close(this.newPermissibleValue);
    }

    selectFromUmls(term: UmlsTerm) {
        this.newPermissibleValue.valueMeaningName = term.name;
        this.newPermissibleValue.valueMeaningDefinition = term.name;
        this.newPermissibleValue.valueMeaningCode = term.ui;
        this.newPermissibleValue.codeSystemName = 'UMLS';
        if (!this.newPermissibleValue.permissibleValue && term.name) {
            this.newPermissibleValue.permissibleValue = term.name;
        }
    }
}
