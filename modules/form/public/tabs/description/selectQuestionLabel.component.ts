import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { FormQuestion, FormSection, Question, QuestionCde } from 'shared/form/form.model';
import { Designation } from 'shared/models.model';

@Component({
    selector: 'cde-select-question-label',
    templateUrl: 'selectQuestionLabel.component.html'
})
export class SelectQuestionLabelComponent {
    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<Designation>();
    cde = new QuestionCde();
    question: Question;
    section: FormSection;

    constructor(private http: HttpClient,
                private alert: AlertService,
                @Inject(MAT_DIALOG_DATA) data: {question: FormQuestion, parent: FormSection}) {
        this.question = data.question.question;
        this.section = data.parent;
        if (this.question.cde.tinyId) {
            let url = '/api/de/' + this.question.cde.tinyId;
            if (this.question.cde.version) { url += '/version/' + this.question.cde.version; }
            this.http.get<QuestionCde>(url).subscribe(
                res => this.cde = res,
                () => {
                    this.alert.addAlert('danger', 'Error load CDE.');
                    this.closed.emit();
                });
        } else {
            this.cde = this.question.cde;
        }
    }
}
