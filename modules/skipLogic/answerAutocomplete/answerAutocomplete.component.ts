import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Token } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

@Component({
    selector: 'cde-answer-autocomplete',
    templateUrl: './answerAutocomplete.component.html'
})
export class AnswerAutocompleteComponent implements OnInit {
    @Input() token?: Token;

    filteredAnswerOptions: Observable<string[]>;
    valueListAnswerControl = new FormControl('', [Validators.required]);
    numberAnswerControl = new FormControl('', [Validators.required]);
    dateAnswerControl = new FormControl('', [Validators.required]);
    textAnswerControl = new FormControl('', [Validators.required]);

    ngOnInit() {
        if (this.token.answer) {
            this.valueListAnswerControl.setValue(this.token);
            this.numberAnswerControl.setValue(this.token);
            this.textAnswerControl.setValue(this.token);
            this.dateAnswerControl.setValue(new Date(this.token.answer));
        }
        this.numberAnswerControl.valueChanges.subscribe(v => this.token.answer = v);
        this.textAnswerControl.valueChanges.subscribe(v => this.token.answer = v);
        this.dateAnswerControl.valueChanges.subscribe(v => this.token.answer = v);
        this.filteredAnswerOptions = this.valueListAnswerControl.valueChanges
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

    selectValueList(event) {
        this.token.answer = event.option.value.permissibleValue;
    }

    selectDate(event) {
        if (event) {
            let date = moment(event.value).format('MM/DD/YYYY');
            this.token.answer = date;
        }
    }

    displayFn(token) {
        let display = '';
        if (token.permissibleValue) display += token.permissibleValue;
        if (token.valueMeaningName) display += " (" + token.valueMeaningName + " )";
        if (display) return display;
        else return token.answer;
    }


}