import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Token } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';

@Component({
    selector: 'cde-question-autocomplete',
    templateUrl: './questionAutocomplete.component.html'
})
export class QuestionAutocompleteComponent implements OnInit {
    @Input() token?: Token;
    @Input() formElement;
    @Input() parent;

    priorQuestions = [];

    filteredQuestionOptions: Observable<string[]>;
    questionControl = new FormControl('', [Validators.required]);

    ngOnInit() {
        this.questionControl.setValue(this.token);
        let realLabel = this.formElement.label ? this.formElement.label : this.formElement.question.cde.name;
        this.priorQuestions = this.getPriorQuestions(this.parent, realLabel);
        this.filteredQuestionOptions = this.questionControl.valueChanges
            .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.label),
                map(value => this._filterQuestion(value))
            );
    }


    private loopFormElements(fe, label, questions) {
        for (let e of fe.formElements) {
            let realLabel = e.label ? e.label : e.question.cde.name;
            if (realLabel === label) return;
            else if (e.elementType === 'question') questions.push(e);
            else this.loopFormElements(e, label, questions);
        }
    }

    private getPriorQuestions(parent, label) {
        let questions = [];
        this.loopFormElements(parent, label, questions);
        return questions;
    }

    private getQuestionByLabel(formElement, label) {
        for (let e of formElement.formElements) {
            if (e.elementType === 'question') {
                let realLabel = e.label ? e.label : e.question.cde.name;
                if (realLabel === label) return e;
            } else return this.getQuestionByLabel(e, label);
        }
    }

    private _filterQuestion(questionLabel): string[] {
        const filterValue = questionLabel.toLowerCase();
        return this.priorQuestions.filter(priorQuestion => {
            let realLabel = priorQuestion.label ? priorQuestion.label : priorQuestion.question.cde.name;
            return realLabel.toLowerCase().includes(filterValue);
        });
    }

    selectQuestion(event) {
        this.token.formElement = event.option.value;
        this.token.selectedQuestion = this.getQuestionByLabel(this.parent, event.option.value.label);
        this.token.label = event.option.value.label ? event.option.value.label : event.option.value.question.cde.name;
    }

    displayFn(token) {
        if (token) {
            if (token.label) return token.label;
            else if (token.question && token.question.cde) return token.question.cde.name;
            else return '';
        } else return '';
    }

}