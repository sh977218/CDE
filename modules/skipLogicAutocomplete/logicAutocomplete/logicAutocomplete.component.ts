import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Token } from 'skipLogicAutocomplete/skipLogicAutocomplete.component';

@Component({
    selector: 'cde-logic-autocomplete',
    templateUrl: './logicAutocomplete.component.html'
})
export class LogicAutocompleteComponent implements OnInit {
    @Input() token: Token;

    logicOptions = ['AND', 'OR'];
    filteredLogicOptions: Observable<string[]>;
    logicControl = new FormControl();

    ngOnInit() {
        this.logicControl.patchValue(this.token.logic);
        this.filteredLogicOptions = this.logicControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterOperator(value))
            );
    }

    private _filterOperator(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.logicOptions.filter(option => option.toLowerCase().includes(filterValue));
    }


}