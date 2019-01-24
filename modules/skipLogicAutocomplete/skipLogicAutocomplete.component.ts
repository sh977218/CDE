import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';

export class Token {
    formElement;
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

    constructor(public skipLogicValidateService: SkipLogicValidateService) {
    }


    ngOnInit() {
        let equationArray = this.formElement.skipLogic.condition.split(/( (?:and|or) )/i);
        if (Array.isArray(equationArray)) {
            equationArray.forEach(equationString => {
                let tokens = equationString.split(/( (?:>|<|>=|<=|=) )/i);
                let token = new Token();
                token.label = tokens[0];
                token.operator = tokens[1];
                token.answer = tokens[2];
                this.tokens.push(token);
            });
        }
        console.log('a');
    }

    addToken() {
        this.tokens.push(new Token);
    }

    saveSkipLogic() {
        this.editMode = false;
        this.onSaved.emit();
    }

}