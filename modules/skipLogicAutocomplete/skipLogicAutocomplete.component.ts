import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';

class Token {
    questionLabel: string;
    operator: string;
    answer: string;
    logic?: string;
}

@Component({
    selector: 'cde-skip-logic-autocomplete',
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent implements OnInit {
    @Input() section;
    @Input() parent;
    @Input() canEdit;
    @Output() onChanged = new EventEmitter();

    tokens: Token[] = [];

    priorQuestions = [];
    selectedQuestion;

    constructor(public skipLogicValidateService: SkipLogicValidateService) {
    }

    loopFormElements(fe, label, questions) {
        for (let e of fe.formElements) {
            if (e.label === label) return;
            else if (e.elementType === 'question') questions.push(e);
            else this.loopFormElements(e, label, questions);
        }
    }


    getPriorQuestions(parent, label) {
        let questions = [];
        this.loopFormElements(parent, label, questions);
        return questions;
    }

    ngOnInit() {
        let temp = this.section.skipLogic.condition.split(/( (?:and|or) )/i);
        if (temp) this.tokens = temp;
        this.priorQuestions = this.getPriorQuestions(this.parent, this.section.label);
        console.log('a');
    }

    addToken() {
        this.tokens.push(new Token);
    }

    selectQuestion(question) {
        this.selectedQuestion = question;
    }

}