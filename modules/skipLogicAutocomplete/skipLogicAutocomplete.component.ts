import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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

    tokens = [];

    constructor(public skipLogicValidateService: SkipLogicValidateService) {
    }

    ngOnInit() {
        this.tokens = this.section.skipLogic.condition.match(/ and | or /ig);
        console.log('a');
    }

}