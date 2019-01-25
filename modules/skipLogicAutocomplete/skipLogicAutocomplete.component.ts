import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export class Token {
    formElement;
    question;
    label: string;
    operator: string = '=';
    answer: string;
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
        let equationArray = this.formElement.skipLogic.condition.split(/( (?:and|or) )/i);
        if (Array.isArray(equationArray)) {
            equationArray.forEach(equationString => {
                let tokens = equationString.split(/( (?:>|<|>=|<=|=) )/i);
                let token = new Token();
                let regex = new RegExp("\"", 'g');
                let labelString = tokens[0];
                if (labelString) labelString = labelString.replace(regex, '').trim();
                let operatorString = tokens[1];
                if (operatorString) operatorString = operatorString.replace(regex, '').trim();
                let answerString = tokens[2];
                if (answerString) answerString = answerString.replace(regex, '').trim();
                token.label = labelString;
                token.operator = operatorString;
                token.answer = answerString;
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