import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-answer-autocomplete',
    templateUrl: './answerAutocomplete.component.html'
})
export class AnswerAutocompleteComponent implements OnInit {
    @Input() canEdit;
    @Input() section;
    @Input() parent;
    @Output() onChanged = new EventEmitter();

    answerOptions = ['1', '2', '3', '4', '5'];
    filteredAnswerOptions: Observable<string[]>;
    answerControl = new FormControl();

    ngOnInit() {
        this.filteredAnswerOptions = this.answerControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterOperator(value))
            );
    }

    private _filterOperator(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.answerOptions.filter(option => option.toLowerCase().includes(filterValue));
    }


}