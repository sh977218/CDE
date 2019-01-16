import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-operator-autocomplete',
    templateUrl: './operatorAutocomplete.component.html'
})
export class OperatorAutocompleteComponent implements OnInit {
    @Input() canEdit;
    @Input() section;
    @Input() parent;
    @Output() onChanged = new EventEmitter();

    operatorOptions = ['=', '>', '<', '>=', '<='];
    filteredOperatorOptions: Observable<string[]>;
    operatorControl = new FormControl();

    ngOnInit() {
        this.filteredOperatorOptions = this.operatorControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterOperator(value))
            );
    }

    private _filterOperator(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.operatorOptions.filter(option => option.toLowerCase().includes(filterValue));
    }


}