import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-answer-autocomplete',
    templateUrl: './answerAutocomplete.component.html'
})
export class AnswerAutocompleteComponent implements OnInit {
    @Input() token;

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
        return this.token.question.answers.filter(option => option.toLowerCase().includes(filterValue));
    }

    selectAnswer(event) {
        this.token.answer = event.option.value.permissibleValue;
    }

    displayFn(answer) {
        if (answer) return answer.permissibleValue;
        else return '';
    }


}