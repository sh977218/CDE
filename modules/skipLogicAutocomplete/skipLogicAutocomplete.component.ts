import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export class Token {
    formElement;
    question;
    label: string = '';
    operator: string = '=';
    answer: string = '';
    logic?: string = 'AND';
}

@Component({
    selector: 'cde-skip-logic-autocomplete',
    templateUrl: './skipLogicAutocomplete.component.html'
})
export class SkipLogicAutocompleteComponent implements OnInit {
    @Input() formElement;
    @Input() parent;
    @Input() canEdit;
    @Output() onSaved = new EventEmitter();

    editMode: boolean = false;
    tokens: Token[] = [];

    ngOnInit() {
//        let regex = /( (?:and|or) )/i;
        let regex = /((?=(?:(?:[^"]*"){2})*[^"]*$)(?:and|or))/;
        let equationArray = this.formElement.skipLogic.condition.split(regex);
        if (Array.isArray(equationArray)) {
            equationArray.forEach(equationString => {
                let tokens = equationString.split(/((?:>|<|>=|<=|=))/i);
                let token = new Token();
                let regex = new RegExp("\"", 'g');
                let labelString = tokens[0];
                if (labelString) token.label = labelString.replace(regex, '').trim();
                let operatorString = tokens[1];
                if (operatorString) token.operator = operatorString.replace(regex, '').trim();
                let answerString = tokens[2];
                if (answerString) token.answer = answerString.replace(regex, '').trim();
                if (token.label) {
                    token.question = this.getQuestionByLabel(this.parent, token.label);
                }
                this.tokens.push(token);
            });
        }
    }

    addToken() {
        this.tokens.push(new Token);
    }

    saveSkipLogic() {
        this.editMode = false;
        let skipLogic = '';
        this.tokens.forEach((t, i) => {
            if (t.label && t.operator && t.answer) {
                skipLogic += '"' + t.label + '"' + t.operator + '"' + t.answer + '"';
                if (i < this.tokens.length - 1) skipLogic += t.logic;
            }
        });
        this.formElement.skipLogic.condition = skipLogic;
        this.onSaved.emit();
    }

    private getQuestionByLabel(formElement, label) {
        for (let e of formElement.formElements) {
            let elementType = e.elementType;
            if (elementType === 'question' && e.label === label) return e;
            else this.getQuestionByLabel(e, label);
        }
    }


}