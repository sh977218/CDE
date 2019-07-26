import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { QuestionCde } from 'shared/form/form.model';

@Component({
    selector: 'cde-select-question-label',
    templateUrl: 'selectQuestionLabel.component.html'
})
export class SelectQuestionLabelComponent {
    question;
    section;
    cde = new QuestionCde();
    @Output() onSelect = new EventEmitter();
    @Output() onClosed = new EventEmitter();

    constructor(private http: HttpClient,
                private alert: AlertService,
                @Inject(MAT_DIALOG_DATA) data) {
        this.question = data.question.question;
        this.section = data.parent;
        if (this.question.cde.tinyId) {
            let url = '/de/' + this.question.cde.tinyId;
            if (this.question.cde.version) { url += '/version/' + this.question.cde.version; }
            this.http.get<QuestionCde>(url).subscribe(
                res => this.cde = res,
                () => {
                    this.alert.addAlert('danger', 'Error load CDE.');
                    this.onClosed.emit();
                });
        } else { this.cde = this.question.cde; }
    }
}
