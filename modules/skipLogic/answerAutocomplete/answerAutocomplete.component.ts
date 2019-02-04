import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Token } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';

@Component({
    selector: 'cde-answer-autocomplete',
    templateUrl: './answerAutocomplete.component.html'
})
export class AnswerAutocompleteComponent implements OnInit {
    @Input() token?: Token;

    filteredAnswerOptions: Observable<string[]>;
    answerControl = new FormControl('', [Validators.required]);

    ngOnInit() {
        if (this.token.answer) this.answerControl.setValue(this.token);
        this.filteredAnswerOptions = this.answerControl.valueChanges
            .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.answer),
                map(value => this._filterOperator(value))
            );
    }

    private _filterOperator(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.token.selectedQuestion.answers.filter(option => option.toLowerCase().includes(filterValue));
    }

    selectAnswer(event) {
        this.token.answer = event.option.value.permissibleValue;
    }

    displayFn(token) {
        let display = '';
        if (token.permissibleValue) display += token.permissibleValue;
        if (token.valueMeaningName) display += " (" + token.valueMeaningName + " )";
        if (display) return display;
        else return token.answer;
    }


}