import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'cde-question-autocomplete',
    templateUrl: './questionAutocomplete.component.html'
})
export class QuestionAutocompleteComponent implements OnInit {
    @Input() token;
    @Input() formElement;
    @Input() parent;

    priorQuestions = [];

    filteredQuestionOptions: Observable<string[]>;
    questionControl = new FormControl();

    ngOnInit() {
        this.filteredQuestionOptions = this.questionControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterQuestion(value))
            );
        this.priorQuestions = this.getPriorQuestions(this.parent, this.formElement.label);
    }


    private loopFormElements(fe, label, questions) {
        for (let e of fe.formElements) {
            if (e.label === label) return;
            else if (e.elementType === 'question') questions.push(e);
            else this.loopFormElements(e, label, questions);
        }
    }

    private getPriorQuestions(parent, label) {
        let questions = [];
        this.loopFormElements(parent, label, questions);
        return questions;
    }

    private _filterQuestion(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.priorQuestions.filter(option => option.toLowerCase().includes(filterValue));
    }

    selectQuestion(event) {
        this.token.formElement = event.option.value;
        this.token.label = event.option.value.label;
    }

    displayFn(q) {
        if (q) return q.label;
        else return '';
    }

}