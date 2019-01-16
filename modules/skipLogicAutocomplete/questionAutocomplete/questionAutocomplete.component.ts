import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-question-autocomplete',
    templateUrl: './questionAutocomplete.component.html'
})
export class QuestionAutocompleteComponent implements OnInit {
    @Input() canEdit;
    @Input() section;
    @Input() parent;
    @Output() onChanged = new EventEmitter();

    questionOptions = ['One', 'Two', 'Three'];
    filteredQuestionOptions: Observable<string[]>;
    questionControl = new FormControl();

    ngOnInit() {
        this.filteredQuestionOptions = this.questionControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterQuestion(value))
            );
    }

    private _filterQuestion(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.questionOptions.filter(option => option.toLowerCase().includes(filterValue));
    }

}