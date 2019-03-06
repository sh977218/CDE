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
        let realLabel = this.formElement.label;
        if (!realLabel && this.formElement.question) realLabel = this.formElement.question.cde.name;

        let priorQuestions = this.getPriorQuestions(this.parent, realLabel);
        let data = {
            formElement: this.formElement,
            parent: this.parent,
            priorQuestions: priorQuestions
        };
        this.dialog.open(SkipLogicAutocompleteComponent, {width: '800px', data: data})
            .afterClosed().subscribe(tokens => {
            if (tokens) {
                this.formElement.skipLogic.condition = this.tokensToSkipLogic(tokens);
                this.onSaved.emit();
            }
        });
    }

    private getPriorQuestions(parent, label) {
        let questions = [];
        this.loopFormElements(parent, label, questions);
        return questions;
    }

    private loopFormElements(fe, label, questions) {
        for (let e of fe.formElements) {
            if (e.elementType === 'question') {
                let realLabel = e.label ? e.label : e.question.cde.name;
                if (realLabel === label) return;
                questions.push(e);
            } else this.loopFormElements(e, label, questions);
        }
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