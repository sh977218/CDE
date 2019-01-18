import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material';
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
    @ViewChild("slInput") slInput: ElementRef;
    @ViewChild("slTrigger") slTrigger: MatAutocompleteTrigger;

    @Input() canEdit;
    @Input() section;
    @Input() parent;
    @Output() onChanged = new EventEmitter();

    tokens: Token[] = [];

    constructor(public skipLogicValidateService: SkipLogicValidateService) {
    }

    ngOnInit() {
        let temp = this.section.skipLogic.condition.split(/( (?:and|or) )/i);
        if (temp) this.tokens = temp;
        console.log('a');
    }

    addToken() {
        this.tokens.push(new Token);
    }

}