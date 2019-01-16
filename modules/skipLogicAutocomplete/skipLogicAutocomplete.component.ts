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

    filteredSkipLogics = [];

    constructor(public skipLogicValidateService: SkipLogicValidateService) {
    }

    ngOnInit() {
    }

    getTypeaheadOptions(event) {
        this.filteredSkipLogics = this.skipLogicValidateService.getTypeaheadOptions(event, this.parent, this.section);
    }

    onSelectItem(parent, question, $event) {
        this.validateSkipLogic(parent, question, $event.option.value);
        this.slInput.nativeElement.focus();
        this.slOptionsReTrigger();
    }


    slOptionsReTrigger() {
        if (this.slInput) {
            setTimeout(() => {
                this.getTypeaheadOptions(this.section.skipLogic.condition);
                this.slTrigger.openPanel();
            }, 0);
        }
    }

    validateSkipLogic(parent, fe, event) {
        if (fe.skipLogic && fe.skipLogic.condition !== event) {
            this.skipLogicValidateService.typeaheadSkipLogic(parent, fe, event);
            this.onChanged.emit();
        }
    }


}