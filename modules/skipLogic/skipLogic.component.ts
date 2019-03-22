import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SkipLogicAutocompleteComponent } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';
import { getQuestionsPrior } from 'shared/form/skipLogic';

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
        let priorQuestions = getQuestionsPrior(this.parent, this.formElement);
        let data = {
            formElement: this.formElement,
            parent: this.parent,
            priorQuestions: priorQuestions
        };
        this.dialog.open(SkipLogicAutocompleteComponent, {width: '800px', data: data}).afterClosed().subscribe(tokens => {
            if (tokens) {
                this.formElement.skipLogic.condition = this.tokensToSkipLogic(tokens);
                this.onSaved.emit();
            }
        });
    }

    tokensToSkipLogic(tokens) {
        let skipLogic = '';
        tokens.forEach((t, i) => {
            if (t.label && t.operator) {
                skipLogic += '"' + t.label + '" ' + t.operator + ' "' + t.answer + '"';
                if (i < tokens.length - 1) skipLogic += " " + t.logic + " ";
            }
        });
        return skipLogic;
    }
}