import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormElement, SkipLogic } from 'shared/form/form.model';
import { getQuestionsPrior } from 'shared/form/skipLogic';
import { SkipLogicAutocompleteComponent, Token } from 'skipLogic/skipLogicAutocomplete/skipLogicAutocomplete.component';

@Component({
    selector: 'cde-skip-logic',
    templateUrl: './skipLogic.component.html'
})
export class SkipLogicComponent {
    @Input() formElement!: FormElement;
    @Input() parent!: FormElement;
    @Input() canEdit!: boolean;
    @Output() saved = new EventEmitter();

    constructor(public dialog: MatDialog) {
    }

    editSkipLogic() {
        const priorQuestions = getQuestionsPrior(this.parent, this.formElement);
        const data = {
            formElement: this.formElement,
            parent: this.parent,
            priorQuestions
        };
        this.dialog.open(SkipLogicAutocompleteComponent, {width: '800px', data}).afterClosed().subscribe(tokens => {
            if (tokens) {
                if (!this.formElement.skipLogic) {
                    this.formElement.skipLogic = new SkipLogic();
                }
                this.formElement.skipLogic.condition = this.tokensToSkipLogic(tokens);
                this.saved.emit();
            }
        });
    }

    tokensToSkipLogic(tokens: Token[]) {
        let skipLogic = '';
        tokens.forEach((t: Token, i: number) => {
            if (t.label && t.operator) {
                skipLogic += '"' + t.label + '" ' + t.operator + ' "' + t.answer + '"';
                if (i < tokens.length - 1) {
                    skipLogic += ' ' + t.logic + ' ';
                }
            }
        });
        return skipLogic;
    }
}
