import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SkipLogicAutocompleteComponent } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';

@Component({
    selector: 'cde-skip-logic',
    templateUrl: './skipLogic.component.html'
})
export class SkipLogicComponent {
    @Input() formElement;
    @Input() parent;
    @Input() canEdit;
    @Output() onSaved = new EventEmitter();

    constructor(public dialog: MatDialog) {
    }

    editSkipLogic() {
        let data = {
            formElement: this.formElement,
            parent: this.parent
        };
        this.dialog.open(SkipLogicAutocompleteComponent, {width: '800px', data: data})
            .afterClosed().subscribe(tokens => {
            if (tokens) {
                this.formElement.skipLogic.condition = this.tokensToSkipLogc(tokens);
                this.onSaved.emit();
            }
        });
    }

    tokensToSkipLogc(tokens) {
        let skipLogic = '';
        if (tokens) {
            tokens.forEach((t, i) => {
                if (t.label && t.operator && t.answer) {
                    skipLogic += '"' + t.label + '"' + t.operator + '"' + t.answer + '"';
                    if (i < tokens.length - 1) skipLogic += t.logic;
                }
            });
        }
        return skipLogic;
    }
}