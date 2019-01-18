import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';

class Token {
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
        let temp = this.formElement.skipLogic.condition.split(/( (?:and|or) )/i);
        if (temp.trim && temp.trim().length) this.tokens = temp;
        console.log('a');
    }

    addToken() {
        this.tokens.push(new Token);
    }

    saveSkipLogic() {
        this.onSaved.emit();
    }

}