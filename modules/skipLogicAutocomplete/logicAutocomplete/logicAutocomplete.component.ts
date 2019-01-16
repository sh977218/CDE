import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-logic-autocomplete',
    templateUrl: './logicAutocomplete.component.html'
})
export class LogicAutocompleteComponent implements OnInit {
    @Input() canEdit;
    @Input() section;
    @Input() parent;
    @Output() onChanged = new EventEmitter();

    logicOptions = ['AND', 'OR'];
    filteredLogicOptions: Observable<string[]>;
    logicControl = new FormControl();

    ngOnInit() {
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